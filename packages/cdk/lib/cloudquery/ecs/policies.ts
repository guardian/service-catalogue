import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { Arn, ArnFormat } from 'aws-cdk-lib';
import type { Cluster } from 'aws-cdk-lib/aws-ecs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export const listOrgsPolicy = new PolicyStatement({
	effect: Effect.ALLOW,
	resources: ['*'],
	actions: ['organizations:List*'],
});

/**
 * This role is provisioned in https://github.com/guardian/aws-account-setup.
 *
 * @see https://github.com/guardian/aws-account-setup/blob/main/packages/cdk/lib/constructs/cloudquery-role.ts
 */
export function cloudqueryAccess(accountId: string) {
	return new PolicyStatement({
		effect: Effect.ALLOW,
		resources: [`arn:aws:iam::${accountId}:role/cloudquery-access`],
		actions: ['sts:AssumeRole'],
	});
}

/**
 * Create a policy statement allowing read access to the given S3 bucket.
 *
 * @param resources a list of S3 bucket ARN resources. E.g.
 * `arn:aws:s3:::my-bucket/foo/*` to allow read access to everything under
 * `/foo`.
 * @returns a policy statement allowing read access to the given S3 bucket
 */
export const readBucketPolicy = (...resources: string[]): PolicyStatement => {
	return new PolicyStatement({
		effect: Effect.ALLOW,
		resources: resources,
		actions: ['s3:GetObject'],
	});
};

export function singletonPolicies(cluster: Cluster) {
	const { account, region } = GuStack.of(cluster);

	return [
		new PolicyStatement({
			effect: Effect.ALLOW,
			resources: ['*'],
			actions: ['ecs:ListTasks'],
		}),
		new PolicyStatement({
			effect: Effect.ALLOW,
			resources: [
				Arn.format({
					partition: 'aws',
					service: 'ecs',
					region,
					account,
					resource: 'task',
					resourceName: `${cluster.clusterName}/*`,
					arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
				}),
			],
			actions: ['ecs:StopTask'],
		}),
	];
}
