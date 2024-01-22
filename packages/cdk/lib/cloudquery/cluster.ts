import { GuLoggingStreamNameParameter } from '@guardian/cdk/lib/constructs/core';
import type { AppIdentity, GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import type { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, type RepositoryImage, Secret } from 'aws-cdk-lib/aws-ecs';
import type { Schedule } from 'aws-cdk-lib/aws-events';
import type { IManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Secret as SecretsManager } from 'aws-cdk-lib/aws-secretsmanager';
import type { CloudqueryConfig } from './config';
import { ScheduledCloudqueryTask } from './task';

export interface CloudquerySource {
	/**
	 * The name of the source.
	 * This will get added to the `Name` tag of the task definition.
	 */
	name: string;

	/**
	 * Purely descriptive, not used for anything runtime related.
	 */
	description: string;

	/**
	 * The rate at which to collect data.
	 *
	 * If this schedule is daily or weekly you should add an equivalent entry to the `cloudquery_table_frequency` table.
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
	 * Any secrets to pass to the ServiceCatalogue container.
	 *
	 * @see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs.ContainerDefinitionOptions.html#secrets
	 * @see https://repost.aws/knowledge-center/ecs-data-security-container-task
	 */
	secrets?: Record<string, Secret>;

	/**
	 * Additional commands to run within the ServiceCatalogue container, executed first.
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

	/**
	 * Any additional security groups applied to the task.
	 * For example, a group allowing access to Riff-Raff.
	 */
	additionalSecurityGroups?: ISecurityGroup[];

	/**
	 * Run this task as a singleton?
	 * Useful to help avoid overlapping runs.
	 *
	 * @default false
	 */
	runAsSingleton?: boolean;

	/**
	 * The image of a CloudQuery plugin that is distributed via Docker,
	 * i.e. plugins not written in Go.
	 *
	 * This image will be run on its own, exposing the GRPC server on localhost:7777.
	 * The CloudQuery source config should be configured with a registry of grpc, and path of localhost:7777.
	 *
	 * @see https://docs.cloudquery.io/docs/reference/source-spec
	 */
	dockerDistributedPluginImage?: RepositoryImage;
}

interface CloudqueryClusterProps extends AppIdentity {
	/**
	 * The VPC to create the cluster in.
	 */
	vpc: IVpc;

	/**
	 * The database for ServiceCatalogue to write to.
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
 * An ECS cluster for running ServiceCatalogue. The cluster and its tasks will be
 * created in the private subnets of the VPC provided.
 */
export class CloudqueryCluster extends Cluster {
	constructor(scope: GuStack, id: string, props: CloudqueryClusterProps) {
		super(scope, id, {
			vpc: props.vpc,
			enableFargateCapacityProviders: true,
		});

		const { stack, stage } = scope;
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

		const taskProps = {
			app,
			cluster: this,
			db,
			dbAccess,
			loggingStreamName,
		};

		const cloudqueryApiKey = new SecretsManager(scope, 'cloudquery-api-key', {
			secretName: `/${stage}/${stack}/${app}/cloudquery-api-key`,
		});

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
				additionalSecurityGroups,
				runAsSingleton = false,
				dockerDistributedPluginImage,
			}) => {
				new ScheduledCloudqueryTask(scope, `CloudquerySource-${name}`, {
					...taskProps,
					name,
					managedPolicies,
					policies: [logShippingPolicy, ...policies],
					schedule,
					sourceConfig: config,
					secrets,
					additionalCommands,
					memoryLimitMiB,
					cpu,
					additionalSecurityGroups,
					runAsSingleton,
					cloudQueryApiKey: Secret.fromSecretsManager(
						cloudqueryApiKey,
						'api-key',
					),
					dockerDistributedPluginImage,
				});
			},
		);
	}
}
