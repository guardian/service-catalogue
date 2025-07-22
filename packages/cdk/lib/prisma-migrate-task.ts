import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import type { ICluster, Volume } from 'aws-cdk-lib/aws-ecs';
import {
	FargateTaskDefinition,
	FireLensLogDriver,
	FirelensLogRouterType,
	LogDrivers,
	PropagatedTagSource,
	Secret,
} from 'aws-cdk-lib/aws-ecs';
import { Rule } from 'aws-cdk-lib/aws-events';
import { EcsTask } from 'aws-cdk-lib/aws-events-targets';
import type { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Images } from './cloudquery/images';

interface PrismaMigrateTaskProps {
	loggingStreamName: string;
	logShippingPolicy: PolicyStatement;
	db: DatabaseInstance;
	dbAccess: GuSecurityGroup;
	cluster: ICluster;
}

export function addPrismaMigrateTask(
	scope: GuStack,
	{
		loggingStreamName,
		logShippingPolicy,
		db,
		dbAccess,
		cluster,
	}: PrismaMigrateTaskProps,
) {
	const app = 'prisma-migrate-task';
	const { stack, stage, region } = scope;

	const roleName = `${app}-${stage}`;
	const taskRole = new Role(scope, roleName, {
		assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
		roleName,
	});

	const fireLensLogDriver = new FireLensLogDriver({
		options: {
			Name: `kinesis_streams`,
			region,
			stream: loggingStreamName,
			retry_limit: '2',
		},
	});

	const taskDefinition = new FargateTaskDefinition(
		scope,
		`${app}TaskDefinition`,
		{
			cpu: 512,
			memoryLimitMiB: 1024,
			taskRole,
		},
	);

	const firelensLogRouter = taskDefinition.addFirelensLogRouter(
		`${app}Firelens`,
		{
			image: Images.devxLogs,
			logging: LogDrivers.awsLogs({
				streamPrefix: [stack, stage, app].join('/'),
				logRetention: RetentionDays.ONE_DAY,
			}),
			environment: {
				STACK: stack,
				STAGE: stage,
				APP: app,
				GU_REPO: 'guardian/service-catalogue',
			},
			firelensConfig: {
				type: FirelensLogRouterType.FLUENTBIT,
			},
			readonlyRootFilesystem: true,
		},
	);

	const firelensVolume: Volume = {
		name: 'firelens-volume',
	};
	taskDefinition.addVolume(firelensVolume);

	firelensLogRouter.addMountPoints({
		containerPath: '/init',
		sourceVolume: firelensVolume.name,
		readOnly: false,
	});

	/**
	 * This error shouldn't ever be thrown as AWS CDK creates a secret by default,
	 * it is just typed as optional.
	 *
	 * @see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_rds.DatabaseInstance.html#credentials.
	 *
	 *	TODO: Remove this once IAM auth is working.
	 */
	if (!db.secret) {
		throw new Error('DB Secret is missing');
	}

	const prismaArtifactKey = `${stack}/${stage}/service-catalogue-prisma-migrations/prisma.zip`;

	const artifactBucketName = StringParameter.valueForStringParameter(
		scope,
		'/account/services/artifact.bucket',
	);

	const artifactBucket = Bucket.fromBucketName(
		scope,
		'artifact-bucket',
		artifactBucketName,
	);

	const prismaTask = taskDefinition.addContainer(`${app}Container`, {
		image: Images.prismaMigrate,
		environment: {
			// These are required so the task can retrieve the Prisma directory
			// from the artifact bucket
			ARTIFACT_BUCKET: artifactBucketName,
			PRISMA_ARTIFACT_KEY: prismaArtifactKey,
		},
		secrets: {
			DB_USERNAME: Secret.fromSecretsManager(db.secret, 'username'),
			DB_HOST: Secret.fromSecretsManager(db.secret, 'host'),
			DB_PASSWORD: Secret.fromSecretsManager(db.secret, 'password'),
		},
		dockerLabels: {
			Stack: stack,
			Stage: stage,
			App: app,
		},
		logging: fireLensLogDriver,
		readonlyRootFilesystem: true,
	});

	taskDefinition.addToTaskRolePolicy(logShippingPolicy);
	db.grantConnect(taskDefinition.taskRole);
	artifactBucket.grantRead(taskDefinition.taskRole, prismaArtifactKey);

	const prismaArtifactVolume: Volume = {
		name: 'artifact-volume',
	};

	taskDefinition.addVolume(prismaArtifactVolume);

	prismaTask.addMountPoints({
		// So that we can download the prisma.zip from the artifact bucket
		containerPath: '/usr/src/app/prisma',
		sourceVolume: prismaArtifactVolume.name,
		readOnly: false,
	});

	// --- EvenBridge rule + target ---

	// Rule that is triggered when the prisma.zip is PUT into the artifact bucket
	const rule = new Rule(scope, 'PrismaMigrateArtifactPutRule', {
		eventPattern: {
			source: ['aws.s3'],
			detailType: ['Object Created'],
			detail: {
                bucket: {
                    name: [artifactBucketName],
                },
                object: {
                    key: [prismaArtifactKey],
                },
            },
		},
	});

	rule.addTarget(
		new EcsTask({
			cluster,
			taskDefinition,
			subnetSelection: { subnets: cluster.vpc.privateSubnets },
			securityGroups: [dbAccess],
			propagateTags: PropagatedTagSource.TASK_DEFINITION,
		}),
	);

	return taskDefinition;
}
