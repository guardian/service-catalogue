import type { AppIdentity, GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { Tags } from 'aws-cdk-lib';
import type { ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import {
	ContainerDependencyCondition,
	FargateTaskDefinition,
	FireLensLogDriver,
	FirelensLogRouterType,
	LogDrivers,
	Secret,
} from 'aws-cdk-lib/aws-ecs';
import type { Cluster, RepositoryImage } from 'aws-cdk-lib/aws-ecs';
import type { ScheduledFargateTaskProps } from 'aws-cdk-lib/aws-ecs-patterns';
import { ScheduledFargateTask } from 'aws-cdk-lib/aws-ecs-patterns';
import type { IManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { dump } from 'js-yaml';
import type { CloudqueryConfig } from './config';
import { postgresDestinationConfig } from './config';
import { Images } from './images';
import { singletonPolicy } from './policies';

export interface ScheduledCloudqueryTaskProps
	extends AppIdentity,
		Omit<ScheduledFargateTaskProps, 'Cluster'> {
	/**
	 * The name of the task.
	 * This will get added to the `Name` tag of the task definition.
	 */
	name: string;

	/**
	 * The Postgres database for CloudQuery to connect to.
	 */
	db: DatabaseInstance;

	/**
	 * The security group to allow CloudQuery to connect to the database.
	 */
	dbAccess: GuSecurityGroup;

	/**
	 * The ECS cluster to run the task in.
	 */
	cluster: Cluster;

	/**
	 * The name of the Kinesis stream to send logs to.
	 */
	loggingStreamName: string;

	/**
	 * Any IAM managed policies to attach to the task.
	 */
	managedPolicies: IManagedPolicy[];

	/**
	 * IAM policies to attach to the task.
	 */
	policies: PolicyStatement[];

	/**
	 * The CloudQuery config to use to collect data from.
	 *
	 * @see https://docs.cloudquery.io/docs/reference/source-spec
	 */
	sourceConfig: CloudqueryConfig;

	/**
	 * Any secrets to pass to the CloudQuery container.
	 *
	 * @see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs.ContainerDefinitionOptions.html#secrets
	 * @see https://repost.aws/knowledge-center/ecs-data-security-container-task
	 */
	secrets?: Record<string, Secret>;

	/**
	 * Any additional commands to run within the CloudQuery container.
	 * These are executed first.
	 */
	additionalCommands?: string[];

	/**
	 * Any additional security groups applied to the task.
	 * For example, a group allowing access to Riff-Raff.
	 */
	additionalSecurityGroups?: ISecurityGroup[];

	/**
	 * Run this task as a singleton?
	 * Useful to help avoid overlapping runs.
	 */
	runAsSingleton: boolean;

	/**
	 * The CloudQuery API key, stored in AWS Secrets Manager.
	 *
	 * @see https://docs.cloudquery.io/docs/deployment/generate-api-key
	 * @see https://cloud.cloudquery.io/teams/the-guardian/api-keys
	 */
	cloudQueryApiKey: Secret;

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

export class ScheduledCloudqueryTask extends ScheduledFargateTask {
	public readonly sourceConfig: CloudqueryConfig;
	constructor(scope: GuStack, id: string, props: ScheduledCloudqueryTaskProps) {
		const {
			name,
			db,
			cluster,
			app,
			dbAccess,
			schedule,
			managedPolicies,
			policies,
			loggingStreamName,
			sourceConfig,
			enabled,
			secrets,
			additionalCommands = [],
			memoryLimitMiB = 512,
			cpu,
			additionalSecurityGroups = [],
			runAsSingleton,
			cloudQueryApiKey,
			dockerDistributedPluginImage,
		} = props;
		const { region, stack, stage } = scope;
		const thisRepo = 'guardian/service-catalogue'; // TODO get this from GuStack

		const task = new FargateTaskDefinition(scope, `${id}TaskDefinition`, {
			memoryLimitMiB,
			cpu,
		});

		/*
		A scheduled task (i.e. `this`) cannot be tagged, so we tag the task definition instead.
		 */
		Tags.of(task).add('Name', name);

		const destinationConfig = postgresDestinationConfig();

		/*
		This error shouldn't ever be thrown as AWS CDK creates a secret by default,
		it is just typed as optional.

		See https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_rds.DatabaseInstance.html#credentials.

		TODO: Remove this once IAM auth is working.
		 */
		if (!db.secret) {
			throw new Error('DB Secret is missing');
		}

		const fireLensLogDriver = new FireLensLogDriver({
			options: {
				Name: `kinesis_streams`,
				region,
				stream: loggingStreamName,
				retry_limit: '2',
			},
		});

		//Do not remove the steampipe plugin list command. It is used to check if the steampipe plugin is installed correctly.
		task.addContainer(`${id}SteampipeContainer`, {
			image: Images.steampipe,
			entryPoint: [''],
			dockerLabels: {
				Stack: stack,
				Stage: stage,
				App: app,
				Name: name,
			},
			command: [
				'/bin/sh',
				'-c',
				[
					'steampipe plugin install --progress=false steampipe',
					'steampipe plugin list',
					'steampipe query "select name from steampipe_registry_plugin;"',
				].join(';'),
			],
			logging: fireLensLogDriver,
		});

		const cloudqueryTask = task.addContainer(`${id}Container`, {
			image: Images.cloudquery,
			entryPoint: [''],
			environment: {
				GOMEMLIMIT: `${Math.floor(memoryLimitMiB * 0.8)}MiB`,
			},
			secrets: {
				...secrets,
				DB_USERNAME: Secret.fromSecretsManager(db.secret, 'username'),
				DB_HOST: Secret.fromSecretsManager(db.secret, 'host'),
				DB_PASSWORD: Secret.fromSecretsManager(db.secret, 'password'),
				CLOUDQUERY_API_KEY: cloudQueryApiKey,
			},
			dockerLabels: {
				Stack: stack,
				Stage: stage,
				App: app,
				Name: name,
			},
			command: [
				'/bin/sh',
				'-c',
				[
					...additionalCommands,

					/*
					Install the CA bundle for all RDS certificates.
					See https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html#UsingWithRDS.SSL.CertificatesAllRegions
					 */
					'wget -O /usr/local/share/ca-certificates/global-bundle.crt -q https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem && update-ca-certificates',

					`printf '${dump(sourceConfig)}' > /source.yaml`,
					`printf '${dump(destinationConfig)}' > /destination.yaml`,
					'/app/cloudquery sync /source.yaml /destination.yaml --log-format json --log-console',
				].join(';'),
			],
			logging: fireLensLogDriver,
		});

		if (dockerDistributedPluginImage) {
			const additionalCloudQueryContainer = task.addContainer(
				`${id}PluginContainer`,
				{
					image: dockerDistributedPluginImage,
					logging: fireLensLogDriver,
					essential: false,
				},
			);

			cloudqueryTask.addContainerDependencies({
				container: additionalCloudQueryContainer,
				condition: ContainerDependencyCondition.START,
			});
		}

		if (runAsSingleton) {
			const operationInProgress = 114;
			const success = 0;

			const singletonTask = task.addContainer(`${id}AwsCli`, {
				image: Images.amazonLinux,
				entryPoint: [''],
				command: [
					'/bin/bash',
					'-c',
					[
						// Install jq to handle JSON, and awscli to query ECS
						'yum install -y -q jq awscli',

						// Who am I?
						`ECS_CLUSTER=$(curl -s $ECS_CONTAINER_METADATA_URI/task | jq -r '.Cluster')`,
						`ECS_FAMILY=$(curl -s $ECS_CONTAINER_METADATA_URI/task | jq -r '.Family')`,
						`ECS_TASK_ARN=$(curl -s $ECS_CONTAINER_METADATA_URI/task | jq -r '.TaskARN')`,

						// How many more of me are there?
						`RUNNING=$(aws ecs list-tasks --cluster $ECS_CLUSTER --family $ECS_FAMILY | jq '.taskArns | length')`,

						// Exit zero (successful) if I'm the only one running
						`[[ $\{RUNNING} > 1 ]] && exit ${operationInProgress} || exit ${success}`,
					].join(';'),
				],
				logging: fireLensLogDriver,

				/*
				A container listed as a dependency of another cannot be marked as essential.
				Below, we describe a dependency such that CloudQuery will only start if the singleton step succeeds.
			 	*/
				essential: false,
			});

			cloudqueryTask.addContainerDependencies({
				container: singletonTask,
				condition: ContainerDependencyCondition.SUCCESS,
			});

			task.addToTaskRolePolicy(singletonPolicy(cluster));
		}

		task.addFirelensLogRouter(`${id}Firelens`, {
			image: Images.devxLogs,
			logging: LogDrivers.awsLogs({
				streamPrefix: [stack, stage, app].join('/'),
				logRetention: RetentionDays.ONE_DAY,
			}),
			environment: {
				STACK: stack,
				STAGE: stage,
				APP: app,
				GU_REPO: thisRepo,
			},
			firelensConfig: {
				type: FirelensLogRouterType.FLUENTBIT,
			},
		});

		managedPolicies.forEach((policy) => task.taskRole.addManagedPolicy(policy));
		policies.forEach((policy) => task.addToTaskRolePolicy(policy));

		db.grantConnect(task.taskRole);

		super(scope, id, {
			schedule,
			cluster,
			vpc: cluster.vpc,
			subnetSelection: { subnets: cluster.vpc.privateSubnets },
			scheduledFargateTaskDefinitionOptions: {
				taskDefinition: task,
			},
			securityGroups: [dbAccess, ...additionalSecurityGroups],
			enabled,
		});

		this.sourceConfig = sourceConfig;
	}
}
