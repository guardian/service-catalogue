import { type GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

const service = 'interactive-monitor';
export class InteractiveMonitor {
	public readonly topic: Topic;
	constructor(guStack: GuStack) {
		const app = guStack.app ?? 'service-catalogue'; //shouldn't be undefined, but make linter happy

		const topic = new Topic(guStack, 'Topic', {
			topicName: `${service}-${guStack.stage}`,
		});

		const githubCredentials = new Secret(guStack, `${service}-github-app`, {
			secretName: `/${guStack.stage}/${guStack.stack}/${app}/${service}-github-app`,
		});

		const lambda = new GuLambdaFunction(guStack, service, {
			app: service,
			fileName: `${service}.zip`,
			handler: 'index.handler',
			runtime: Runtime.NODEJS_18_X,
			environment: {
				BUCKET: '???',
				GITHUB_APP_SECRET: githubCredentials.secretName,
			},
			reservedConcurrentExecutions: 1,
		});

		topic.addSubscription(new LambdaSubscription(lambda, {}));
		this.topic = topic;
	}
}
