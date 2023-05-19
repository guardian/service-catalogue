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
import type { App } from 'aws-cdk-lib';
import { Duration, Tags } from 'aws-cdk-lib';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	Port,
} from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';
import { ScheduledCloudqueryTask } from './task';

export class Cloudquery extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const app = this.constructor.name.toLowerCase();
		Tags.of(this).add('App', app);

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

		const cluster = new Cluster(this, `${app}Cluster`, {
			vpc,
			enableFargateCapacityProviders: true,
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

		const coreTaskProps = {
			app,
			cluster,
			db,
			dbAccess,
			managedPolicies,
			policies,
			loggingStreamName,
		};

		// Collect these tables at a frequency other than once a day
		const customRateTables = [
			new ScheduledCloudqueryTask(this, 'AwsS3Buckets', {
				...coreTaskProps,
				schedule: Schedule.rate(Duration.hours(2)),
				tables: ['aws_s3_buckets'],
			}),

			new ScheduledCloudqueryTask(this, 'AwsLambdaFunctions', {
				...coreTaskProps,
				schedule: Schedule.rate(Duration.minutes(30)),
				tables: ['aws_lambda_functions'],
			}),
		]
			.flatMap((_) => _.tables)
			.filter(Boolean) as string[]; // filter out undefined

		// Collect every other table once a day
		new ScheduledCloudqueryTask(this, 'AwsOther', {
			...coreTaskProps,
			schedule: Schedule.rate(Duration.days(1)),
			tables: ['*'],
			skipTables: customRateTables,
		});
	}
}
