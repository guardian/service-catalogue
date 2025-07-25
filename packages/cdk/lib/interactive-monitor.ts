import { type GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import type { ITopic } from 'aws-cdk-lib/aws-sns';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

const service = 'interactive-monitor';
export class InteractiveMonitor {
	public readonly topic: Topic;
	constructor(guStack: GuStack, gitHubOrg: string, anghammaradTopic: ITopic,) {
		const app = guStack.app ?? 'service-catalogue'; //shouldn't be undefined, but make linter happy
		const { stage, stack } = guStack;
		const topic = new Topic(guStack, 'Topic', {
			topicName: `${service}-${stage}`,
		});

		const githubCredentials = new Secret(guStack, `${service}-github-app`, {
			secretName: `/${stage}/${stack}/${app}/${service}-github-app`,
		});

		const lambda = new GuLambdaFunction(guStack, service, {
			app: service,
			architecture: Architecture.ARM_64,
			fileName: `${service}.zip`,
			handler: 'index.handler',
			runtime: Runtime.NODEJS_20_X,
			environment: {
				ANGHAMMARAD_SNS_ARN: anghammaradTopic.topicArn,
				GITHUB_APP_SECRET: githubCredentials.secretName,
				GITHUB_ORG: gitHubOrg,
			},
			reservedConcurrentExecutions: 1,
		});

		const policyStatement = new PolicyStatement({
			effect: Effect.ALLOW,
			actions: ['s3:ListBucket'],
			resources: ['arn:aws:s3:::gdn-cdn', 'arn:aws:s3:::gdn-cdn/*'],
		});

		lambda.addToRolePolicy(policyStatement);
		githubCredentials.grantRead(lambda);
		topic.addSubscription(new LambdaSubscription(lambda, {}));
		this.topic = topic;
	}
}
