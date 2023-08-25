import type { AppIdentity, GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { Tags } from 'aws-cdk-lib';
import type { Cluster } from 'aws-cdk-lib/aws-ecs';
import {
	ContainerImage,
	FargateTaskDefinition,
	FirelensConfigFileType,
	FireLensLogDriver,
	FirelensLogRouterType,
	LogDrivers,
	Secret,
} from 'aws-cdk-lib/aws-ecs';
import type { ScheduledFargateTaskProps } from 'aws-cdk-lib/aws-ecs-patterns';
import { ScheduledFargateTask } from 'aws-cdk-lib/aws-ecs-patterns';
import { Rule } from 'aws-cdk-lib/aws-events';
import { SnsTopic } from 'aws-cdk-lib/aws-events-targets';
import type { IManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import type { Topic } from 'aws-cdk-lib/aws-sns';
import { dump } from 'js-yaml';
import type { CloudqueryConfig } from './config';
import { postgresDestinationConfig } from './config';
import { Versions } from './versions';

const cloudqueryImage = ContainerImage.fromRegistry(
	`ghcr.io/cloudquery/cloudquery:${Versions.CloudqueryCli}`,
);

const firelensImage = ContainerImage.fromRegistry(
	'ghcr.io/guardian/hackday-firelens:main',
);

export interface ScheduledCloudqueryTaskProps
	extends AppIdentity,
		Omit<ScheduledFargateTaskProps, 'Cluster'> {
	/**
	 * The name of the source.
	 * This will get added to the `Name` tag of the task definition.
	 */
	name: string;

	/**
	 * THe Postgres database for ServiceCatalogue to connect to.
	 */
	db: DatabaseInstance;

	/**
	 * The security group to allow ServiceCatalogue to connect to the database.
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
	 * The IAM managed policies to attach to the task.
	 */
	managedPolicies: IManagedPolicy[];

	/**
	 * The IAM policies to attach to the task.
	 */
	policies: PolicyStatement[];

	/**
	 * The ServiceCatalogue config to use to collect data from.
	 */
	sourceConfig: CloudqueryConfig;

	/**
	 * The topic used to notify someone if a task fails
	 */
	topic: Topic;

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
			topic,
			enabled,
			secrets,
			additionalCommands = [],
			memoryLimitMiB,
			cpu,
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

		task.addContainer(`${id}Container`, {
			image: cloudqueryImage,
			entryPoint: [''],
			secrets: {
				...secrets,
				DB_USERNAME: Secret.fromSecretsManager(db.secret, 'username'),
				DB_HOST: Secret.fromSecretsManager(db.secret, 'host'),
				DB_PASSWORD: Secret.fromSecretsManager(db.secret, 'password'),
			},
			command: [
				'/bin/sh',
				'-c',
				[
					...additionalCommands,
					'wget -O /usr/local/share/ca-certificates/rds-ca-2019-root.crt -q https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem && update-ca-certificates',
					`printf '${dump(sourceConfig)}' > /source.yaml`,
					`printf '${dump(destinationConfig)}' > /destination.yaml`,
					'/app/cloudquery sync /source.yaml /destination.yaml --log-format json --log-console',
				].join(';'),
			],
			logging: new FireLensLogDriver({
				options: {
					Name: `kinesis_streams`,
					region,
					stream: loggingStreamName,
					retry_limit: '2',
				},
			}),
		});

		task.addFirelensLogRouter(`${id}Firelens`, {
			image: firelensImage,
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
				options: {
					enableECSLogMetadata: true,
					configFileType: FirelensConfigFileType.FILE,
					configFileValue: '/custom.conf',
				},
			},
		});

		new Rule(scope, `${id}-TaskErrorRule`, {
			description:
				'Rule for events indicating an ECS task exited due to an error.',
			eventPattern: {
				detail: {
					clusterArn: [cluster.clusterArn],
					containers: {
						exitCode: [
							1, // application error
							137, // sigkill force exit
							139, // segmentation fault
							255, // container entrypoint cmd failed
						],
					},
					lastStatus: ['STOPPED'],
					stoppedReason: [`Task ${id} exited`],
					taskDefinitionArn: [task.taskDefinitionArn],
				},
				detailType: ['ECS Task State Change'],
				source: ['aws.ecs'],
			},
		}).addTarget(new SnsTopic(topic));

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
			securityGroups: [dbAccess],
			enabled,
		});

		this.sourceConfig = sourceConfig;
	}
}
