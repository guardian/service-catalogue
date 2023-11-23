import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export class BranchProtector {
	public githubCredentials: Secret;
	constructor(guStack: GuStack) {
		const { stack, stage } = guStack;
		const app = 'branch-protector';
		const githubCredentials = new Secret(guStack, `${app}-github-app-auth`, {
			secretName: `/${stage}/${stack}/service-catalogue/${app}-github-app-secret`,
		});
		this.githubCredentials = githubCredentials;
	}
}
