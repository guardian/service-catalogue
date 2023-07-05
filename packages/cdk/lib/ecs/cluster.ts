import { GuLoggingStreamNameParameter } from '@guardian/cdk/lib/constructs/core';
import type { AppIdentity, GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import type { Secret } from 'aws-cdk-lib/aws-ecs/lib/container-definition';
import type { Schedule } from 'aws-cdk-lib/aws-events';
import type { IManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Topic } from 'aws-cdk-lib/aws-sns';
import type { CloudqueryConfig } from './config';
import { ScheduledCloudqueryTask } from './task';

export interface CloudquerySource {
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

	/**
	 * Any secrets to pass to the CloudQuery container.
	 *
	 * @see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs.ContainerDefinitionOptions.html#secrets
	 * @see https://repost.aws/knowledge-center/ecs-data-security-container-task
	 */
	secrets?: Record<string, Secret>;

	/**
	 * Additional commands to run within the CloudQuery container, executed first.
	 */
	additionalCommands?: string[];

	/**
	 * The amount (in MiB) of memory used by the task.
	 */
	memoryLimitMiB?: 512 | 1024 | 2048 | 3072 | 4096 | 8192 | 16384 | 32768;

	/**
	 * The number of cpu units used by the task.
	 */
	cpu?: 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16384;
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

		const logShippingPolicy = new PolicyStatement({
			actions: ['kinesis:Describe*', 'kinesis:Put*'],
			effect: Effect.ALLOW,
			resources: [loggingStreamArn],
		});

		const topic = new Topic(scope, 'CloudQueryAlertTopic');

		const taskProps = {
			app,
			cluster: this,
			db,
			dbAccess,
			loggingStreamName,
			topic,
		};

		sources.forEach(
			({
				name,
				schedule,
				config,
				managedPolicies = [],
				policies = [],
				secrets,
				additionalCommands,
				memoryLimitMiB,
				cpu,
			}) => {
				new ScheduledCloudqueryTask(scope, `CloudquerySource-${name}`, {
					...taskProps,
					managedPolicies,
					policies: [logShippingPolicy, ...policies],
					schedule,
					sourceConfig: config,
					secrets,
					additionalCommands,
					memoryLimitMiB,
					cpu,
				});
			},
		);
	}
}
