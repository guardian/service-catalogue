import type { AppIdentity, GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import type { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import {
	Cluster,
	ContainerInsights,
	type RepositoryImage,
	Secret,
} from 'aws-cdk-lib/aws-ecs';
import type { Schedule } from 'aws-cdk-lib/aws-events';
import type { IManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import type { Secret as SecretsManager } from 'aws-cdk-lib/aws-secretsmanager';
import type { CloudqueryConfig } from './config';
import { CloudqueryWriteMode } from './config';
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

	/**
	 * Specifies the update method to use when inserting rows to Postgres.
	 *
	 * @default {@link CloudqueryWriteMode.OverwriteDeleteStale}
	 */
	writeMode?: CloudqueryWriteMode;
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

	loggingStreamName: string;

	logShippingPolicy: PolicyStatement;

	cloudqueryApiKey: SecretsManager;

	/**
	 * Each CloudQuery data collection task has a schedule.
	 * When true, the schedule will be enabled, and data collection will occur as defined.
	 * When false, the schedule will be disabled. Tasks will need to be run manually using the CLI.
	 */
	enableCloudquerySchedules: boolean;
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
			containerInsightsV2: ContainerInsights.ENABLED,
		});

		const {
			app,
			db,
			dbAccess,
			sources,
			loggingStreamName,
			logShippingPolicy,
			cloudqueryApiKey,
			enableCloudquerySchedules,
		} = props;

		const taskProps = {
			app,
			cluster: this,
			db,
			dbAccess,
			loggingStreamName,
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
				additionalSecurityGroups,
				runAsSingleton = false,
				dockerDistributedPluginImage,
				writeMode = CloudqueryWriteMode.OverwriteDeleteStale,
			}) => {
				new ScheduledCloudqueryTask(scope, `CloudquerySource-${name}`, {
					...taskProps,
					enabled: enableCloudquerySchedules,
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
					writeMode,
				});
			},
		);
	}
}
