import type { AppIdentity, GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { Duration, Tags } from 'aws-cdk-lib';
import type { ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import type { Cluster, RepositoryImage, Volume } from 'aws-cdk-lib/aws-ecs';
import {
	ContainerDependencyCondition,
	FargateTaskDefinition,
	FireLensLogDriver,
	FirelensLogRouterType,
	LogDrivers,
	PropagatedTagSource,
	Secret,
} from 'aws-cdk-lib/aws-ecs';
import type { ScheduledFargateTaskProps } from 'aws-cdk-lib/aws-ecs-patterns';
import { ScheduledFargateTask } from 'aws-cdk-lib/aws-ecs-patterns';
import type { IManagedPolicy } from 'aws-cdk-lib/aws-iam';
import {
	Effect,
	ManagedPolicy,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { dump } from 'js-yaml';
import type { CloudQuerySourceConfig, CloudqueryWriteMode } from './config';
import { renderCloudquerySourceConfig } from './config';
import {
	postgresDestinationConfig,
	serviceCatalogueConfigDirectory,
} from './config';
import { Images } from './images';
import { singletonPolicy } from './policies';
import { scheduleFrequencyMs } from './schedule';

export interface ScheduledCloudqueryTaskProps
	extends AppIdentity,
		Omit<ScheduledFargateTaskProps, 'cluster'> {
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
	sourceConfig: CloudQuerySourceConfig;

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
	 *
	 * The containers filesystem is mostly read-only. If you need to write files you can use the /usr/share/cloudquery folder.
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

	/**
	 * Specifies the update method to use when inserting rows to Postgres.
	 */
	writeMode: CloudqueryWriteMode;
}

export class ScheduledCloudqueryTask extends ScheduledFargateTask {
	public readonly sourceConfig: CloudQuerySourceConfig;
	public readonly name: string;
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
			writeMode,
		} = props;
		const { region, stack, stage } = scope;
		const thisRepo = 'guardian/service-catalogue'; // TODO get this from GuStack
		const frequency = scheduleFrequencyMs(schedule);

		const roleName = `${app}-${stage}-task-${name}`;
		const taskRole = new Role(scope, roleName, {
			assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
			roleName,
		});

		const xrayPolicy = ManagedPolicy.fromAwsManagedPolicyName(
			'AWSXrayWriteOnlyAccess',
		);

		const task = new FargateTaskDefinition(scope, `${id}TaskDefinition`, {
			memoryLimitMiB,
			cpu,
			taskRole,
			family: name,
		});

		/*
		The `Name` tag is used by our `cli` project.
		See `/repo/root/packages/cli`.
		A scheduled task (i.e. `this`) cannot be tagged, so we tag the task definition instead.
		 */
		Tags.of(task).add('Name', name);

		const destinationConfig = postgresDestinationConfig(writeMode);

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
			readonlyRootFilesystem: true,
			command: [
				'/bin/sh',
				'-c',
				[
					...additionalCommands,
					`printf '${renderCloudquerySourceConfig(sourceConfig)}' > ${serviceCatalogueConfigDirectory}/source.yaml`,
					`printf '${dump(destinationConfig)}' > ${serviceCatalogueConfigDirectory}/destination.yaml`,
					`/app/cloudquery sync ${serviceCatalogueConfigDirectory}/source.yaml ${serviceCatalogueConfigDirectory}/destination.yaml --log-format json --log-console --no-log-file`,
				].join(';'),
			],
			logging: fireLensLogDriver,
		});

		const configVolume: Volume = {
			name: 'config-volume',
		};
		task.addVolume(configVolume);

		const cqVolume: Volume = {
			name: 'cloudquery-volume',
		};
		task.addVolume(cqVolume);

		const tmpVolume: Volume = {
			name: 'tmp-volume',
		};
		task.addVolume(tmpVolume);

		cloudqueryTask.addMountPoints(
			{
				// So that we can write task config to this directory
				containerPath: serviceCatalogueConfigDirectory,
				sourceVolume: configVolume.name,
				readOnly: false,
			},
			{
				// So that Cloudquery can write to this directory
				containerPath: '/app/.cq',
				sourceVolume: cqVolume.name,
				readOnly: false,
			},
			{
				// So that Cloudquery can write temporary data
				containerPath: '/tmp',
				sourceVolume: tmpVolume.name,
				readOnly: false,
			},
		);

		const otel = task.addContainer(`${id}AWSOTELCollector`, {
			image: Images.otelCollector,
			command: ['--config=/etc/ecs/ecs-xray.yaml'],
			logging: fireLensLogDriver,
			healthCheck: {
				command: ['CMD', '/healthcheck'],
				interval: Duration.seconds(5),
			},
			portMappings: [
				{
					containerPort: 4318,
				},
			],
			readonlyRootFilesystem: true,
		});

		cloudqueryTask.addContainerDependencies({
			container: otel,
			condition: ContainerDependencyCondition.HEALTHY,
		});

		if (dockerDistributedPluginImage) {
			const additionalCloudQueryContainer = task.addContainer(
				`${id}PluginContainer`,
				{
					image: dockerDistributedPluginImage,
					logging: fireLensLogDriver,
					essential: false,
					readonlyRootFilesystem: true,
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
				image: Images.singletonImage,
				entryPoint: [''],
				command: [
					'/bin/bash',
					'-c',
					[
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
				readonlyRootFilesystem: true,
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

		const tableValues = [...sourceConfig.spec.tables]
			.sort()
			.map((table) => `('${table}', ${frequency})`)
			.join(',');

		task.addContainer(`${id}PostgresContainer`, {
			image: Images.postgres,
			entryPoint: [''],
			secrets: {
				PGUSER: Secret.fromSecretsManager(db.secret, 'username'),
				PGHOST: Secret.fromSecretsManager(db.secret, 'host'),
				PGPASSWORD: Secret.fromSecretsManager(db.secret, 'password'),
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
					`psql -c "INSERT INTO cloudquery_table_frequency VALUES ${tableValues} ON CONFLICT (table_name) DO UPDATE SET frequency = ${frequency}"`,
				].join(';'),
			],
			logging: fireLensLogDriver,
			essential: false,
			readonlyRootFilesystem: true,
		});

		const firelensLogRouter = task.addFirelensLogRouter(`${id}Firelens`, {
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
				TASK_NAME: name,
			},
			firelensConfig: {
				type: FirelensLogRouterType.FLUENTBIT,
			},
			readonlyRootFilesystem: true,
		});

		const firelensVolume: Volume = {
			name: 'firelens-volume',
		};
		task.addVolume(firelensVolume);

		firelensLogRouter.addMountPoints({
			containerPath: '/init',
			sourceVolume: firelensVolume.name,
			readOnly: false,
		});

		managedPolicies.forEach((policy) => task.taskRole.addManagedPolicy(policy));
		policies.forEach((policy) => task.addToTaskRolePolicy(policy));
		task.taskRole.addManagedPolicy(xrayPolicy);

		/*
		GuardDuty is enabled at the organisation level and runs as a sidecar.
		We need to add specific permissions to allow pulling the GuardDuty image.
		See https://docs.aws.amazon.com/guardduty/latest/ug/prereq-runtime-monitoring-ecs-support.html.
		 */
		const guardDutyPolicies = [
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ['ecr:GetAuthorizationToken'],
				resources: ['*'],
			}),
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: [
					'ecr:BatchCheckLayerAvailability',
					'ecr:GetDownloadUrlForLayer',
					'ecr:BatchGetImage',
				],
				resources: [
					// See https://docs.aws.amazon.com/guardduty/latest/ug/runtime-monitoring-ecr-repository-gdu-agent.html
					'arn:aws:ecr:eu-west-1:694911143906:repository/aws-guardduty-agent-fargate',
				],
			}),
		];

		guardDutyPolicies.forEach((policy) =>
			task.addToExecutionRolePolicy(policy),
		);

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
			propagateTags: PropagatedTagSource.TASK_DEFINITION,
		});

		this.sourceConfig = sourceConfig;
		this.name = name;
	}
}
