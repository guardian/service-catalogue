import type { AppIdentity, GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { Duration, Tags } from 'aws-cdk-lib';
import type { ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import type {
	Cluster,
	FargateTaskDefinitionProps,
	RepositoryImage,
	Volume,
} from 'aws-cdk-lib/aws-ecs';
import {
	ContainerDependencyCondition,
	FargateTaskDefinition,
	FireLensLogDriver,
	FirelensLogRouterType,
	LogDrivers,
	PropagatedTagSource,
	Secret,
} from 'aws-cdk-lib/aws-ecs';
import { ScheduledFargateTask } from 'aws-cdk-lib/aws-ecs-patterns';
import type { Schedule } from 'aws-cdk-lib/aws-events';
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

export interface CloudqueryTaskProps
	extends AppIdentity, FargateTaskDefinitionProps {
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

export class CloudqueryTask extends FargateTaskDefinition {
	public readonly fireLensLogDriver: FireLensLogDriver;

	constructor(scope: GuStack, id: string, props: CloudqueryTaskProps) {
		const {
			name,
			db,
			cluster,
			app,
			managedPolicies,
			policies,
			loggingStreamName,
			sourceConfig,
			secrets,
			additionalCommands = [],
			memoryLimitMiB = 512,
			cpu,
			writeMode,
			cloudQueryApiKey,
			runAsSingleton,
			dockerDistributedPluginImage,
		} = props;
		const { region, stack, stage } = scope;
		const thisRepo = 'guardian/service-catalogue'; // TODO get this from GuStack

		const roleName = `${app}-${stage}-task-${name}`;
		const taskRole = new Role(scope, roleName, {
			assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
			roleName,
		});

		const xrayPolicy = ManagedPolicy.fromAwsManagedPolicyName(
			'AWSXrayWriteOnlyAccess',
		);

		super(scope, `${id}TaskDefinition`, {
			memoryLimitMiB,
			cpu,
			taskRole,
			family: name,
		});

		/*
		The `Name` tag is used by our `cli` project.
		See `/repo/root/packages/cli`.
		 */
		Tags.of(this).add('Name', name);

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

		const cloudqueryTask = this.addContainer(`${id}Container`, {
			image: Images.cloudquery,
			entryPoint: [''],
			environment: {
				GOMEMLIMIT: `${Math.floor(memoryLimitMiB * 0.8)}MiB`,
				// We use Cloudquery's default log level of 'info' unless this is overriden
				// see: https://docs.cloudquery.io/docs/cli-reference/cloudquery_sync
				CLOUDQUERY_LOG_LEVEL: 'info',
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
					`printf '${renderCloudquerySourceConfig(sourceConfig).replaceAll("'", "'\\''")}' > ${serviceCatalogueConfigDirectory}/source.yaml`,
					`printf '${dump(destinationConfig).replaceAll("'", "'\\''")}' > ${serviceCatalogueConfigDirectory}/destination.yaml`,
					`/app/cloudquery sync ${serviceCatalogueConfigDirectory}/source.yaml ${serviceCatalogueConfigDirectory}/destination.yaml --log-format json --log-console --no-log-file --log-level \${CLOUDQUERY_LOG_LEVEL}`,
				].join(';'),
			],
			logging: fireLensLogDriver,
		});

		const configVolume: Volume = {
			name: 'config-volume',
		};
		this.addVolume(configVolume);

		const cqVolume: Volume = {
			name: 'cloudquery-volume',
		};
		this.addVolume(cqVolume);

		const tmpVolume: Volume = {
			name: 'tmp-volume',
		};
		this.addVolume(tmpVolume);

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

		const otel = this.addContainer(`${id}AWSOTELCollector`, {
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
			const additionalCloudQueryContainer = this.addContainer(
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

			const singletonTask = this.addContainer(`${id}AwsCli`, {
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

			this.addToTaskRolePolicy(singletonPolicy(cluster));
		}

		const firelensLogRouter = this.addFirelensLogRouter(`${id}Firelens`, {
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
		this.addVolume(firelensVolume);

		firelensLogRouter.addMountPoints({
			containerPath: '/init',
			sourceVolume: firelensVolume.name,
			readOnly: false,
		});

		managedPolicies.forEach((policy) => this.taskRole.addManagedPolicy(policy));
		policies.forEach((policy) => this.addToTaskRolePolicy(policy));
		this.taskRole.addManagedPolicy(xrayPolicy);

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
			this.addToExecutionRolePolicy(policy),
		);

		db.grantConnect(this.taskRole);

		this.fireLensLogDriver = fireLensLogDriver;
	}
}

export interface ScheduledCloudqueryTaskProps extends CloudqueryTaskProps {
	/**
	 * The schedule or rate (frequency) that determines when CloudWatch Events
	 * runs the rule. For more information, see
	 * [Schedule Expression Syntax for Rules](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html)
	 * in the Amazon CloudWatch User Guide.
	 */
	readonly schedule: Schedule;

	/**
	 * Indicates whether the rule is enabled.
	 */
	readonly enabled: boolean;

	/**
	 * The security group to allow CloudQuery to connect to the database.
	 */
	dbAccess: GuSecurityGroup;

	/**
	 * Any additional security groups applied to the task.
	 * For example, a group allowing access to Riff-Raff.
	 */
	additionalSecurityGroups?: ISecurityGroup[];
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
			sourceConfig,
			enabled,
			additionalSecurityGroups = [],
		} = props;
		const { stack, stage } = scope;
		const frequency = scheduleFrequencyMs(schedule);

		const task = new CloudqueryTask(scope, id, props);

		/*
		This error shouldn't ever be thrown as AWS CDK creates a secret by default,
		it is just typed as optional.

		See https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_rds.DatabaseInstance.html#credentials.

		TODO: Remove this once IAM auth is working.
		 */
		if (!db.secret) {
			throw new Error('DB Secret is missing');
		}

		const { fireLensLogDriver } = task;

		const tableValues = sourceConfig.spec.tables
			.toSorted()
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
