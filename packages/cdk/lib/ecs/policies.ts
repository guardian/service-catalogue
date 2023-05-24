import type { IManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';

export const readonlyAccessManagedPolicy = (
	scope: Construct,
	id: string,
): IManagedPolicy =>
	ManagedPolicy.fromManagedPolicyArn(
		scope,
		`readonly-policy-${id}`,
		'arn:aws:iam::aws:policy/ReadOnlyAccess',
	);

export const standardDenyPolicy =
	// See https://github.com/cloudquery/iam-for-aws-orgs/ and
	// https://github.com/cloudquery/iam-for-aws-orgs/blob/d44ffe5509ba8a6c84c31dcc1dac7f475a5099e3/template.yml#L95.
	new PolicyStatement({
		effect: Effect.DENY,
		resources: ['*'],
		actions: [
			'cloudformation:GetTemplate',
			'dynamodb:GetItem',
			'dynamodb:BatchGetItem',
			'dynamodb:Query',
			'dynamodb:Scan',
			'ec2:GetConsoleOutput',
			'ec2:GetConsoleScreenshot',
			'ecr:BatchGetImage',
			'ecr:GetAuthorizationToken',
			'ecr:GetDownloadUrlForLayer',
			'kinesis:Get*',
			'lambda:GetFunction',
			'logs:GetLogEvents',
			'sdb:Select*',
			'sqs:ReceiveMessage',
		],
	});

export const listOrgsPolicy = new PolicyStatement({
	effect: Effect.ALLOW,
	resources: ['*'],
	actions: ['organizations:List*'],
});

export function cloudqueryAccess(accountId: string) {
	return new PolicyStatement({
		effect: Effect.ALLOW,
		resources: [`arn:aws:iam::${accountId}:role/cloudquery-access`],
		actions: ['sts:AssumeRole'],
	});
}
