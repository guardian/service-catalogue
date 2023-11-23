import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export class BranchProtector {
	public githubCredentials: Secret;
	constructor(guStack: GuStack) {
		const { stack, stage } = guStack;
		const app = 'branch-protector';
		const githubCredentials = new Secret(
			guStack,
			`branch-protector-github-app-auth`,
			{
				secretName: `/${stage}/${stack}/service-catalogue/branch-protector-github-app-secret`,
			},
		);
		this.githubCredentials = githubCredentials;
	}
}
