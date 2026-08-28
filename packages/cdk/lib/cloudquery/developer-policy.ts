import { NAMED_SSM_PARAMETER_PATHS } from '@guardian/cdk/lib/constants';
import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuDeveloperPolicyExperimentalProps } from '@guardian/cdk/lib/experimental/constructs/iam/policies';
import { GuDeveloperPolicyExperimental } from '@guardian/cdk/lib/experimental/constructs/iam/policies';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { Secret as SecretsManager } from 'aws-cdk-lib/aws-secretsmanager';

function ssmArn(stack: GuStack, parameterName: string): string {
	return stack.formatArn({
		service: 'ssm',
		resource: 'parameter',
		/* Strip any leading slash because formatArn already inserts a separator between
		   resource and resourceName so a leading slash would produce a double slash. */
		resourceName: parameterName.replace(/^\//, ''),
	});
}

const GRANT_ID = 'service-catalogue-dev';

export function buildCliDeveloperPolicy(scope: GuStack) {
	const { stage, stack, app = 'service-catalogue' } = scope;
	const SSMPolicy = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['ssm:GetParameter'],
		resources: [
			ssmArn(scope, `${stage}/${stack}/${app}/*`),
			ssmArn(
				scope,
				`${stage}/deploy/riff-raff/external-database-access-security-group`,
			),
			ssmArn(scope, NAMED_SSM_PARAMETER_PATHS.PrimaryVpcPrivateSubnets.path),
		],
	});

	const ecsListPolicy = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['ecs:ListClusters', 'ecs:ListTaskDefinitions'],
		// These actions don't support resource-level permissions, resource must be '*'
		resources: ['*'],
	});

	const ecsListTagsPolicy = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['ecs:ListTagsForResource'],
		resources: [
			// We need to get tags from all clusters to determine which operates in a given stage
			scope.formatArn({
				service: 'ecs',
				resource: 'cluster',
				resourceName: '*',
			}),
			/* We need to get tags from all task definitions
			 * because we can't tell which operate in any given stage from their name */
			scope.formatArn({
				service: 'ecs',
				resource: 'task-definition',
				resourceName: '*:*',
			}),
		],
	});

	// A task needs to have a role passed to it to be able to run
	const iamRolePolicy = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['iam:PassRole'],
		resources: [
			scope.formatArn({
				service: 'iam',
				region: '',
				resource: 'role',
				resourceName: `deploy-${stage}-service-*`,
			}),
		],
		conditions: {
			StringEquals: {
				'iam:PassedToService': 'ecs-tasks.amazonaws.com',
			},
		},
	});

	// Allow running any task because task definition names have no stage-specific patterns
	const ecsRunTaskPolicy = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['ecs:RunTask'],
		resources: [
			scope.formatArn({
				service: 'ecs',
				resource: 'task-definition',
				resourceName: '*:*',
			}),
		],
	});

	const cliPolicyProps: GuDeveloperPolicyExperimentalProps = {
		grantId: GRANT_ID,
		friendlyName: 'Invoke Cloudquery jobs from CLI',
		statements: [
			SSMPolicy,
			ecsListPolicy,
			ecsListTagsPolicy,
			iamRolePolicy,
			ecsRunTaskPolicy,
		],
		// Not enforcing checks because we're using wildcards knowingly and safely in some places.
		withoutPolicyChecks: true,
	};

	new GuDeveloperPolicyExperimental(
		scope,
		'ServiceCatalogueCliPolicy',
		cliPolicyProps,
	);
}

export function buildRunLocallyDeveloperPolicy(
	scope: GuStack,
	{
		cloudqueryApiKey,
		cloudqueryGithubCredentials,
	}: {
		cloudqueryApiKey: SecretsManager;
		cloudqueryGithubCredentials: SecretsManager;
	},
) {
	const fetchSecretPolicy = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['secretsmanager:GetSecretValue'],
		resources: [
			cloudqueryApiKey.secretArn,
			cloudqueryGithubCredentials.secretArn,
		],
	});

	const listTopicsPolicy = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['sns:ListTopics'],
		resources: ['*'],
	});

	const listRegions = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['ec2:DescribeRegions'],
		resources: ['*'],
	});

	// for aws_lambda_functions table
	const listFunctionsPolicy = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: [
			'lambda:GetCodeSigningConfig',
			'lambda:GetFunction',
			'lambda:GetFunctionCodeSigningConfig',
			'lambda:GetFunctionConcurrency',
			'lambda:GetPolicy',
			'lambda:GetRuntimeManagementConfig',
			'lambda:ListFunctions',
			'lambda:ListTags',
		],
		resources: ['*'],
	});

	// for aws_securityhub_findings
	const listSecurityhubFindings = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['securityhub:GetFindings'],
		resources: ['*'],
	});

	// for aws_s3_buckets
	const listS3Buckets = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: [
			's3:GetBucketPolicyStatus',
			's3:GetBucketTagging',
			's3:ListAllMyBuckets',
		],
		resources: ['*'],
	});

	// for aws_ec2_images
	const listEc2Images = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['ec2:DescribeImages'],
		resources: ['*'],
	});

	// for aws_organizations_accounts and related Organizations tables
	const listOrganizations = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: [
			'organizations:DescribeOrganizationalUnit',
			'organizations:ListAccounts',
			'organizations:ListChildren',
			'organizations:ListParents',
			'organizations:ListRoots',
			'organizations:ListTagsForResource',
		],
		resources: ['*'],
	});

	const listInspectorFindings = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['inspector2:ListFindings'],
		resources: ['*'],
	});

	const { stage, stack, app = 'service-catalogue' } = scope;
	const SSMPolicy = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['ssm:GetParameter'],
		resources: [
			ssmArn(scope, `${stage}/${stack}/${app}/*`),
			ssmArn(scope, 'account/services/anghammarad.topic.arn'),
		],
	});

	const runLocalPolicyProps: GuDeveloperPolicyExperimentalProps = {
		grantId: GRANT_ID,
		friendlyName: 'Run Service Catalogue Cloudquery jobs locally',
		statements: [
			SSMPolicy,
			fetchSecretPolicy,
			listTopicsPolicy,
			listRegions,
			listFunctionsPolicy,
			listSecurityhubFindings,
			listS3Buckets,
			listEc2Images,
			listOrganizations,
			listInspectorFindings,
		],
		withoutPolicyChecks: true,
	};

	new GuDeveloperPolicyExperimental(
		scope,
		'ServiceCatalogueLocalPolicy',
		runLocalPolicyProps,
	);
}
