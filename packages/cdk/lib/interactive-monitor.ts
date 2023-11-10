import { type GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

const app = 'interactive-monitor';

export class InteractiveMonitor {
	public topic: Topic;
	constructor(guStack: GuStack) {
		const topic = new Topic(guStack, 'Topic', {
			topicName: `${app}-topic`,
		});

		const lambda = new GuLambdaFunction(guStack, app, {
			app,
			fileName: `${app}.zip`,
			handler: 'index.handler',
			runtime: Runtime.NODEJS_18_X,
			environment: {
				BUCKET: '???',
				GITHUB_CREDENTIALS: '???',
			},
		});

		topic.addSubscription(new LambdaSubscription(lambda, {}));

		this.topic = topic;
	}
}
