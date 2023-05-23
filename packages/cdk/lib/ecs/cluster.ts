import { GuLoggingStreamNameParameter } from '@guardian/cdk/lib/constructs/core';
import type { AppIdentity, GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import type { Schedule } from 'aws-cdk-lib/aws-events';
import type { IManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import type { CloudqueryConfig } from './config';
import { ScheduledCloudqueryTask } from './task';

interface CloudquerySource {
	/**
	 * The name of the source.
	 */
	name: string;

	/**
	 * Purely descriptive, not used for anything runtime related.
	 */
	description: string;

	/**
	 * The rate at which to collect data.
	 */
	schedule: Schedule;

	/**
	 * Cloudquery config (aka 'spec') for this source.
	 *
	 * This should be the JS version of whatever YAML config you want to use for this source.
	 */
	config: CloudqueryConfig;

	/**
	 * Policies required by this source.
	 */
	policies?: PolicyStatement[];

	/**
	 * Managed policies required by this source.
	 */
	managedPolicies?: IManagedPolicy[];
}

interface CloudqueryClusterProps extends AppIdentity {
	/**
	 * The VPC to create the cluster in.
	 */
	vpc: IVpc;

	/**
	 * The database for CloudQuery to write to.
	 */
	db: DatabaseInstance;

	/**
	 * The security group that provides access to the database.
	 */
	dbAccess: GuSecurityGroup;

	/**
	 * Which tables to collect at a frequency other than once a day.
	 */
	sources: CloudquerySource[];
}

/**
 * An ECS cluster for running CloudQuery. The cluster and its tasks will be
 * created in the private subnets of the VPC provided.
 */
export class CloudqueryCluster extends Cluster {
	constructor(scope: GuStack, id: string, props: CloudqueryClusterProps) {
		super(scope, id, {
			vpc: props.vpc,
			enableFargateCapacityProviders: true,
		});

		const { app, db, dbAccess, sources } = props;

		const loggingStreamName =
			GuLoggingStreamNameParameter.getInstance(scope).valueAsString;
		const loggingStreamArn = scope.formatArn({
			service: 'kinesis',
			resource: 'stream',
			resourceName: loggingStreamName,
		});

		const essentialPolicies = [
			// Log shipping
			new PolicyStatement({
				actions: ['kinesis:Describe*', 'kinesis:Put*'],
				effect: Effect.ALLOW,
				resources: [loggingStreamArn],
			}),

			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: ['arn:aws:iam::*:role/cloudquery-access'],
				actions: ['sts:AssumeRole'],
			}),
		];

		const taskProps = {
			app,
			cluster: this,
			db,
			dbAccess,
			loggingStreamName,
		};

		sources.forEach(
			({ name, schedule, config, managedPolicies = [], policies = [] }) => {
				new ScheduledCloudqueryTask(scope, `CloudquerySource-${name}`, {
					...taskProps,
					managedPolicies,
					policies: essentialPolicies.concat(policies),
					schedule,
					sourceConfig: config,
				});
			},
		);
	}
}
