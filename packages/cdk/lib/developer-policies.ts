import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { NAMED_SSM_PARAMETER_PATHS } from '@guardian/cdk/lib/constants';
import {
	GuDeveloperPolicyExperimental,
	GuDeveloperPolicyExperimentalProps,
} from '@guardian/cdk/lib/experimental/constructs/iam/policies';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

function ssmArn(stack: GuStack, parameterName: string): string {
	return stack.formatArn({
		service: 'ssm',
		resource: 'parameter',
		/* Strip any leading slash because formatArn already inserts a separator between
           resource and resourceName so a leading slash would produce a double slash. */
		resourceName: parameterName.replace(/^\//, ''),
	});
}

export function createCloudqueryCliDeveloperPolicy(
	scope: GuStack,
): GuDeveloperPolicyExperimental {
	const { stage, stack } = scope;

	const app = scope.app ?? 'service-catalogue';

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

	// These actions can only operate on '*'
	const ecsListPolicy = new PolicyStatement({
		effect: Effect.ALLOW,
		actions: ['ecs:ListClusters', 'ecs:ListTaskDefinitions'],
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
		grantId: 'service-catalogue-cli',
		friendlyName: 'Service Catalogue CLI',
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

	return new GuDeveloperPolicyExperimental(
		scope,
		'ServiceCatalogueCliPolicy',
		cliPolicyProps,
	);
}
