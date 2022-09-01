import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuRole } from '@guardian/cdk/lib/constructs/iam';
import { CfnOutput, CfnParameter, Tags } from 'aws-cdk-lib';
import type { App } from 'aws-cdk-lib';
import {
	AccountPrincipal,
	Effect,
	Policy,
	PolicyStatement,
} from 'aws-cdk-lib/aws-iam';

export class CdkMetadataAccess extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const cdkMetadataAccountId = '095768028460';

		const stack = new CfnParameter(this, 'Stack', {
			description: 'Riffraff stack',
		});

		Tags.of(this).add('Stack', stack.valueAsString); // Needed to override stack info at runtime.

		const role = new GuRole(this, 'CdkMetadataRole', {
			roleName: 'cdk-metadata-access',
			description: 'Role CdkMetadata uses to crawl resources in this account',
			assumedBy: new AccountPrincipal(cdkMetadataAccountId),
		});

		new Policy(this, 'CdkMetadataPolicy', {
			policyName: 'CdkMetadataCollection',
			roles: [role],
			statements: [
				new PolicyStatement({
					effect: Effect.ALLOW,
					resources: ['*'],
					actions: [
						'cloudformation:Describe*',
						'cloudformation:Get*',
						'cloudformation:List*',
					],
				}),
			],
		});

		new CfnOutput(this, 'Role', {
			value: role.roleArn,
			description: 'CdkMetadata Role',
		});
	}
}
