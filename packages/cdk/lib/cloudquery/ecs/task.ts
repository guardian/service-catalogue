import type { AppIdentity, GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { Tags } from 'aws-cdk-lib';
import type { ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import type { Cluster } from 'aws-cdk-lib/aws-ecs';
import {
	ContainerDependencyCondition,
	ContainerImage,
	FargateTaskDefinition,
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
import { singletonPolicy } from './policies';
import { Versions } from './versions';

const cloudqueryImage = ContainerImage.fromRegistry(
	`ghcr.io/cloudquery/cloudquery:${Versions.CloudqueryCli}`,
);

const firelensImage = ContainerImage.fromRegistry(
	'ghcr.io/guardian/devx-logs:2',
);

const awsImage = ContainerImage.fromRegistry(
	'public.ecr.aws/amazonlinux/amazonlinux:latest',
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

	/**
	 * Extra security groups applied to the task for accessing resources such as RiffRaff
	 */
	extraSecurityGroups?: ISecurityGroup[];

	/**
	 * Run this task as a singleton?
	 * Useful to help avoid overlapping runs.
	 */
	runAsSingleton: boolean;
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
			memoryLimitMiB = 512,
			cpu,
			extraSecurityGroups,
			runAsSingleton,
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

		const cloudqueryTask = task.addContainer(`${id}Container`, {
			image: cloudqueryImage,
			entryPoint: [''],
			environment: {
				GOMEMLIMIT: `${Math.floor(memoryLimitMiB * 0.8)}MiB`,
			},
			secrets: {
				...secrets,
				DB_USERNAME: Secret.fromSecretsManager(db.secret, 'username'),
				DB_HOST: Secret.fromSecretsManager(db.secret, 'host'),
				DB_PASSWORD: Secret.fromSecretsManager(db.secret, 'password'),
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
			logging: new FireLensLogDriver({
				options: {
					Name: `kinesis_streams`,
					region,
					stream: loggingStreamName,
					retry_limit: '2',
				},
			}),
		});

		if (runAsSingleton) {
			const singletonTask = task.addContainer(`${id}AwsCli`, {
				image: awsImage,
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

						// Exit zero (successfull) if I'm the only one running
						'[ ${RUNNING} -gt 1 ] && exit 114 || exit 0',
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

			task.addToTaskRolePolicy(singletonPolicy());
		}

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
			securityGroups: [dbAccess, ...(extraSecurityGroups ?? [])],
			enabled,
		});

		this.sourceConfig = sourceConfig;
	}
}
