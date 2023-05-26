import type { AppIdentity, GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import type { Cluster } from 'aws-cdk-lib/aws-ecs';
import {
	ContainerDependencyCondition,
	ContainerImage,
	FargateTaskDefinition,
	FirelensConfigFileType,
	FireLensLogDriver,
	FirelensLogRouterType,
	LogDrivers,
} from 'aws-cdk-lib/aws-ecs';
import type { ScheduledFargateTaskProps } from 'aws-cdk-lib/aws-ecs-patterns';
import { ScheduledFargateTask } from 'aws-cdk-lib/aws-ecs-patterns';
import type { Secret } from 'aws-cdk-lib/aws-ecs/lib/container-definition';
import type { IManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { dump } from 'js-yaml';
import type { CloudqueryConfig } from './config';
import { postgresDestinationConfig } from './config';
import { Versions } from './versions';

const awsCliImage = ContainerImage.fromRegistry(
	'public.ecr.aws/aws-cli/aws-cli',
);

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
	 * THe Postgres database for CloudQuery to connect to.
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
	 * The IAM managed policies to attach to the task.
	 */
	managedPolicies: IManagedPolicy[];

	/**
	 * The IAM policies to attach to the task.
	 */
	policies: PolicyStatement[];

	/**
	 * The CloudQuery config to use to collect data from.
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
	 * Additional commands to run within the CloudQuery container, executed first.
	 */
	additionalCommands?: string[];
}

export class ScheduledCloudqueryTask extends ScheduledFargateTask {
	public readonly sourceConfig: CloudqueryConfig;
	constructor(scope: GuStack, id: string, props: ScheduledCloudqueryTaskProps) {
		const {
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
		} = props;
		const { region, stack, stage } = scope;
		const thisRepo = 'guardian/service-catalogue'; // TODO get this from GuStack

		const task = new FargateTaskDefinition(scope, `${id}TaskDefinition`);

		const dbUser = 'cloudquery';
		const destinationConfig = postgresDestinationConfig();

		// This container is used to generate the DB auth token, storing it on a volume that's shared with the CloudQuery container
		const dbAuth = task.addContainer(`${id}AwsCli`, {
			image: awsCliImage,
			environment: {
				DB_HOST: db.dbInstanceEndpointAddress,
			},
			entryPoint: [''],
			command: [
				'/bin/bash',
				'-c',
				[
					`PG_PASSWORD=$(/usr/local/bin/aws rds generate-db-auth-token --hostname $DB_HOST --port 5432 --region eu-west-1 --username ${dbUser})`,
					`echo "user=${dbUser} password=$PG_PASSWORD host=$DB_HOST port=5432 dbname=postgres sslmode=verify-full" > /var/scratch/connection_string`,
				].join(';'),
			],

			/*
			A container that is listed as a dependency of another cannot be marked as essential.
			Below, we describe a dependency such that CloudQuery will only start if the DB Auth step succeeds.
			 */
			essential: false,
		});

		const cloudqueryTask = task.addContainer(`${id}Container`, {
			image: cloudqueryImage,
			entryPoint: [''],
			secrets,
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

		task.addVolume({ name: 'scratch', host: {} });
		dbAuth.addMountPoints({
			containerPath: '/var/scratch',
			sourceVolume: 'scratch',
			readOnly: false,
		});
		cloudqueryTask.addMountPoints({
			containerPath: '/var/scratch',
			sourceVolume: 'scratch',
			readOnly: true,
		});

		cloudqueryTask.addContainerDependencies({
			container: dbAuth,

			// Only start the worker once the DB auth token has been generated
			condition: ContainerDependencyCondition.SUCCESS,
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

		managedPolicies.forEach((policy) => task.taskRole.addManagedPolicy(policy));
		policies.forEach((policy) => task.addToTaskRolePolicy(policy));
		db.grantConnect(task.taskRole, dbUser);

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
