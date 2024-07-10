import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import { Duration } from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Rule, RuleTargetInput, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Architecture, LoggingFormat, Runtime } from 'aws-cdk-lib/aws-lambda';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import type { ITopic } from 'aws-cdk-lib/aws-sns';

type CloudBusterProps = {
	vpc: IVpc;
	dbAccess: GuSecurityGroup;
	db: DatabaseInstance;
	anghammaradTopic: ITopic;
};

export class CloudBuster {
	constructor(stack: GuStack, props: CloudBusterProps) {
		const { vpc, dbAccess, db, anghammaradTopic } = props;
		const app = 'cloudbuster';

		const lambda = new GuLambdaFunction(stack, 'cloudbuster', {
			app,
			vpc,
			architecture: Architecture.ARM_64,
			runtime: Runtime.NODEJS_20_X,
			securityGroups: [dbAccess],
			fileName: `${app}.zip`,
			handler: 'index.main',
			environment: {
				ANGHAMMARAD_SNS_ARN: anghammaradTopic.topicArn,
				DATABASE_HOSTNAME: db.dbInstanceEndpointAddress,
				QUERY_LOGGING: 'false',
			},
			timeout: Duration.minutes(5),
			// Unfortunately Prisma doesn't support streaming data from Postgres at the moment https://github.com/prisma/prisma/issues/5055
			// This means that all rows need to be loaded into memory at the same time whenever a query is ran hence the high memory requirement.
			memorySize: 4096,
			errorPercentageMonitoring: {
				toleratedErrorPercentage: 0,
				snsTopicName: 'devx-alerts',
			},

			/*
			Override the default provided by GuCDK for improved compatability with https://github.com/guardian/cloudwatch-logs-management when producing log lines with markers.

			Note: `logFormat` is a deprecated property, replaced with `loggingFormat`.
			However, we can only specify one of `logFormat` or `loggingFormat`, and as GuCDK is setting `logFormat`, we have to do the same.
			TODO - patch GuCDK.

			See also: https://github.com/guardian/cloudwatch-logs-management/issues/326.
			 */
			logFormat: LoggingFormat.TEXT,
		});

		anghammaradTopic.grantPublish(lambda);

		new Rule(stack, `cloudbuster-critical`, {
			description: `Daily execution of the Cloudbuster lambda for critical findings`,
			schedule: Schedule.cron({ minute: '0', hour: '9' }),
			targets: [
				new LambdaFunction(lambda, {
					event: RuleTargetInput.fromObject({ severities: ['CRITICAL'] }),
				}),
			],
		});

		new Rule(stack, `cloudbuster-high`, {
			description: `Weekly execution of the Cloudbuster lambda for high findings`,
			schedule: Schedule.cron({ weekDay: 'MON', hour: '9', minute: '0' }),
			targets: [
				new LambdaFunction(lambda, {
					event: RuleTargetInput.fromObject({ severities: ['HIGH'] }),
				}),
			],
		});

		db.grantConnect(lambda, 'cloudbuster');
	}
}
