import * as fs from 'fs';
import * as path from 'path';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import {
	GuLoggingStreamNameParameter,
	GuStack,
} from '@guardian/cdk/lib/constructs/core';
import {
	GuSecurityGroup,
	GuVpc,
	SubnetType,
} from '@guardian/cdk/lib/constructs/ec2';
import { GuardianOrganisationalUnits } from '@guardian/private-infrastructure-config';
import type { App } from 'aws-cdk-lib';
import { Duration, Tags } from 'aws-cdk-lib';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	Port,
} from 'aws-cdk-lib/aws-ec2';
import {
	Cluster,
	ContainerImage,
	FargateTaskDefinition,
	FirelensConfigFileType,
	FireLensLogDriver,
	FirelensLogRouterType,
	LogDrivers,
	Secret,
} from 'aws-cdk-lib/aws-ecs';
import { ScheduledFargateTask } from 'aws-cdk-lib/aws-ecs-patterns';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';

const cloudqueryImage = ContainerImage.fromRegistry(
	'ghcr.io/cloudquery/cloudquery:3.3.1',
);

const firelensImage = ContainerImage.fromRegistry(
	'ghcr.io/guardian/hackday-firelens:main',
);

export class Cloudquery extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const app = this.constructor.name.toLowerCase();
		Tags.of(this).add('App', app);

		const { stack, stage, region } = this;
		const thisRepo = 'guardian/service-catalogue'; // TODO get this from GuStack

		const loggingStreamName =
			GuLoggingStreamNameParameter.getInstance(this).valueAsString;
		const loggingStreamArn = this.formatArn({
			service: 'kinesis',
			resource: 'stream',
			resourceName: loggingStreamName,
		});

		const privateSubnets = GuVpc.subnetsFromParameter(this, {
			type: SubnetType.PRIVATE,
		});

		const vpc = GuVpc.fromIdParameter(this, 'PrimaryVpc', {
			/*
			CDK wants privateSubnetIds to be a multiple of availabilityZones.
			We're pulling the subnets from a parameter at runtime.
			We know they evaluate to 3 subnets, but at compile time CDK doesn't.

			Set the number of AZs to 1 to avoid the error:
			  `Error: Number of privateSubnetIds (1) must be a multiple of availability zones (2).`
			 */
			availabilityZones: ['ignored'],
			privateSubnetIds: privateSubnets.map((subnet) => subnet.subnetId),
		});

		const dbPort = 5432;

		const db = new DatabaseInstance(this, 'Database', {
			engine: DatabaseInstanceEngine.POSTGRES,
			port: dbPort,
			vpc,
			vpcSubnets: { subnets: vpc.privateSubnets },
			iamAuthentication: true,
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			storageEncrypted: true,
		});

		const dbAccess = new GuSecurityGroup(this, 'DbAccess', {
			app,
			vpc,
		});
		db.connections.allowFrom(dbAccess, Port.tcp(dbPort));

		// TODO remove once IAM Auth is working
		if (!db.secret) {
			throw new Error('DB Secret is missing');
		}

		const cluster = new Cluster(this, `${app}Cluster`, {
			vpc,
			enableFargateCapacityProviders: true,
		});

		const task = new FargateTaskDefinition(this, 'TaskDefinition');

		const config = fs.readFileSync(path.join(__dirname, 'config.yaml'), {
			encoding: 'utf-8',
		});

		task.addContainer(`CloudQuery`, {
			image: cloudqueryImage,
			environment: {
				TARGET_ORG_UNIT: GuardianOrganisationalUnits.Root,
			},
			secrets: {
				DB_HOST: Secret.fromSecretsManager(db.secret, 'host'),
				DB_PASSWORD: Secret.fromSecretsManager(db.secret, 'password'),
			},
			entryPoint: [''],
			command: [
				'/bin/sh',
				'-c',
				[
					`printf '${config}' > /config.yaml`,
					'/app/cloudquery sync /config.yaml --log-format json --log-console',
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

		task.addFirelensLogRouter('firelens', {
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

		const managedPolicies = [
			ManagedPolicy.fromManagedPolicyArn(
				this,
				'readonly-policy',
				'arn:aws:iam::aws:policy/ReadOnlyAccess',
			),
		];

		const policies = [
			// Log shipping
			new PolicyStatement({
				actions: ['kinesis:Describe*', 'kinesis:Put*'],
				effect: Effect.ALLOW,
				resources: [loggingStreamArn],
			}),

			// See https://github.com/cloudquery/iam-for-aws-orgs/ and
			// https://github.com/cloudquery/iam-for-aws-orgs/blob/d44ffe5509ba8a6c84c31dcc1dac7f475a5099e3/template.yml#L95.
			new PolicyStatement({
				effect: Effect.DENY,
				resources: ['*'],
				actions: [
					'cloudformation:GetTemplate',
					'dynamodb:GetItem',
					'dynamodb:BatchGetItem',
					'dynamodb:Query',
					'dynamodb:Scan',
					'ec2:GetConsoleOutput',
					'ec2:GetConsoleScreenshot',
					'ecr:BatchGetImage',
					'ecr:GetAuthorizationToken',
					'ecr:GetDownloadUrlForLayer',
					'kinesis:Get*',
					'lambda:GetFunction',
					'logs:GetLogEvents',
					'sdb:Select*',
					'sqs:ReceiveMessage',
				],
			}),

			// TODO add these once running in the deployTools account
			// new PolicyStatement({
			// 	effect: Effect.ALLOW,
			// 	resources: ['arn:aws:iam::*:role/cloudquery-access'],
			// 	actions: ['sts:AssumeRole'],
			// }),
			//
			// new PolicyStatement({
			// 	effect: Effect.ALLOW,
			// 	resources: ['*'],
			// 	actions: ['organizations:List*'],
			// }),
		];

		managedPolicies.forEach((policy) => task.taskRole.addManagedPolicy(policy));
		policies.forEach((policy) => task.addToTaskRolePolicy(policy));
		db.grantConnect(task.taskRole);

		new ScheduledFargateTask(this, 'ScheduledTask', {
			schedule: Schedule.rate(Duration.days(1)),
			cluster,
			vpc,
			subnetSelection: { subnets: privateSubnets },
			scheduledFargateTaskDefinitionOptions: {
				taskDefinition: task,
			},
			securityGroups: [dbAccess],
		});
	}
}
