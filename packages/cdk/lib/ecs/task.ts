import type { AppIdentity, GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
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
import type { IManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
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
	 * The CloudQuery config to use to store data to.
	 *
	 * @default Postgres
	 */
	destinationConfig?: CloudqueryConfig;
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
			destinationConfig = postgresDestinationConfig(),
		} = props;
		const { region, stack, stage } = scope;
		const thisRepo = 'guardian/service-catalogue'; // TODO get this from GuStack

		// TODO remove once IAM Auth is working
		if (!db.secret) {
			throw new Error('DB Secret is missing');
		}

		const task = new FargateTaskDefinition(scope, `${id}TaskDefinition`);

		task.addContainer(`${id}Container`, {
			image: cloudqueryImage,
			secrets: {
				DB_HOST: Secret.fromSecretsManager(db.secret, 'host'),
				DB_PASSWORD: Secret.fromSecretsManager(db.secret, 'password'),
			},
			entryPoint: [''],
			command: [
				'/bin/sh',
				'-c',
				[
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
		});

		this.sourceConfig = sourceConfig;
	}
}
