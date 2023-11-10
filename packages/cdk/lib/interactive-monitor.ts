import { type GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

export class InteractiveMonitor {
	public topic: Topic;
	constructor(guStack: GuStack) {
		const topic = new Topic(guStack, 'Topic', {
			topicName: 'interactive-monitor-topic',
		});

		const lambda = new GuLambdaFunction(guStack, 'interactive-monitor', {
			app: guStack.app ?? '',
			fileName: 'interactive-monitor.zip',
			handler: 'index.handler',
			runtime: Runtime.NODEJS_18_X,
			environment: {
				TOPIC_ARN: topic.topicArn,
				BUCKET: '???',
				GITHUB_CREDENTIALS: '???',
			},
		});

		topic.addSubscription(new LambdaSubscription(lambda, {}));

		this.topic = topic;
	}
}
