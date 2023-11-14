import type { GuScheduledLambdaProps } from '@guardian/cdk';
import { GuScheduledLambda } from '@guardian/cdk';
import type {
	GuLambdaErrorPercentageMonitoringProps,
	NoMonitoring,
} from '@guardian/cdk/lib/constructs/cloudwatch';
import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { Duration } from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import type { ITopic } from 'aws-cdk-lib/aws-sns';
import { Queue } from 'aws-cdk-lib/aws-sqs';

export class BranchProtector {
	public readonly queue: Queue;
	constructor(
		guStack: GuStack,
		monitoringConfiguration:
			| NoMonitoring
			| GuLambdaErrorPercentageMonitoringProps,
		nonProdSchedule: Schedule | undefined,
		vpc: IVpc,
		anghammaradTopic: ITopic,
	) {
		const { stack, stage } = guStack;
		const app = 'branch-protector';
		const queue = new Queue(guStack, `${app}-queue`, {
			queueName: `${app}-queue-${stage}.fifo`,
			contentBasedDeduplication: true,
			retentionPeriod: Duration.days(14),
		});

		const githubCredentials = new Secret(guStack, `${app}-github-app-auth`, {
			secretName: `/${stage}/${stack}/service-catalogue/${app}-github-app-secret`,
		});

		const lambdaProps: GuScheduledLambdaProps = {
			app,
			fileName: `${app}.zip`,
			handler: 'index.main',
			monitoringConfiguration,
			rules: [
				{
					schedule:
						nonProdSchedule ??
						Schedule.cron({ minute: '0', hour: '9', weekDay: 'TUE-FRI' }),
				},
			],
			runtime: Runtime.NODEJS_18_X,
			environment: {
				GITHUB_APP_SECRET: githubCredentials.secretName,
				ANGHAMMARAD_SNS_ARN: anghammaradTopic.topicArn,
				BRANCH_PROTECTOR_QUEUE_URL: queue.queueUrl,
			},
			vpc,
			timeout: Duration.minutes(1),
		};

		const lambda = new GuScheduledLambda(guStack, app, lambdaProps);

		queue.grantConsumeMessages(lambda);
		githubCredentials.grantRead(lambda);
		anghammaradTopic.grantPublish(lambda);

		this.queue = queue;
	}
}
