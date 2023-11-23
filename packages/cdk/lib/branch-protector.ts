import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { Duration } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Queue } from 'aws-cdk-lib/aws-sqs';

export class BranchProtector {
	public readonly queue: Queue;
	public githubCredentials: Secret;
	constructor(guStack: GuStack) {
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

		this.queue = queue;
		this.githubCredentials = githubCredentials;
	}
}
