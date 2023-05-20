import { GuLoggingStreamNameParameter } from '@guardian/cdk/lib/constructs/core';
import type { AppIdentity, GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { Duration } from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { awsSourceConfigForOrganisation } from './config';
import { ScheduledCloudqueryTask } from './task';

interface CloudqueryClusterProps extends AppIdentity {
	vpc: IVpc;
	db: DatabaseInstance;
	dbAccess: GuSecurityGroup;
}

interface CustomRateTable {
	schedule: Schedule;
	tables: string[];
}

// Collect these tables at a frequency other than once a day
const customRateTables: CustomRateTable[] = [
	{
		schedule: Schedule.rate(Duration.hours(2)),
		tables: ['aws_s3_buckets'],
	},
	{
		schedule: Schedule.rate(Duration.minutes(30)),
		tables: ['aws_lambda_functions'],
	},
];

export class CloudqueryCluster extends Cluster {
	constructor(scope: GuStack, id: string, props: CloudqueryClusterProps) {
		super(scope, id, {
			vpc: props.vpc,
			enableFargateCapacityProviders: true,
		});

		const { app, db, dbAccess } = props;

		const loggingStreamName =
			GuLoggingStreamNameParameter.getInstance(scope).valueAsString;
		const loggingStreamArn = scope.formatArn({
			service: 'kinesis',
			resource: 'stream',
			resourceName: loggingStreamName,
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

			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: ['arn:aws:iam::*:role/cloudquery-access'],
				actions: ['sts:AssumeRole'],
			}),

			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: ['*'],
				actions: ['organizations:List*'],
			}),
		];

		const coreTaskProps = {
			app,
			cluster: this,
			db,
			dbAccess,
			managedPolicies,
			policies,
			loggingStreamName,
		};

		customRateTables.forEach(({ schedule, tables }, index) => {
			new ScheduledCloudqueryTask(scope, `AwsCustomRate${index}`, {
				...coreTaskProps,
				schedule,
				sourceConfig: awsSourceConfigForOrganisation({
					tables,
				}),
			});
		});

		// Collect every other table once a day
		new ScheduledCloudqueryTask(scope, 'AwsOther', {
			...coreTaskProps,
			schedule: Schedule.rate(Duration.days(1)),
			sourceConfig: awsSourceConfigForOrganisation({
				tables: ['*'],
				skipTables: customRateTables.flatMap((_) => _.tables),
			}),
		});
	}
}
