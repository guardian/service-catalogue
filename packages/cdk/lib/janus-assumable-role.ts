import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import {
	GuJanusAssumableRole,
	type GuJanusAssumableRoleProps,
} from '@guardian/cdk/lib/constructs/iam';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

function ssmArn(stack: GuStack, parameterName: string): string {
	return stack.formatArn({
		service: 'ssm',
		resource: 'parameter',
		resourceName: parameterName,
	});
}

export class JanusAssumableRoles {
	constructor(thisStack: GuStack, cloudqueryTasksArn: string) {
		const { stack, stage, app } = thisStack;
		const janusRoleProps: GuJanusAssumableRoleProps = {
			janusPermission: `run-cloudquery-tasks-${stage.toLowerCase()}`,
			janusName: `Run CloudQuery Cluster ${stage} Role`,
			janusDescription: `Role for running CloudQuery tasks in the ${stage} environment.`,
		};

		const cqClusterCliRole = new GuJanusAssumableRole(
			thisStack,
			janusRoleProps,
		);

		const SSMPolicy = new PolicyStatement({
			effect: Effect.ALLOW,
			actions: ['ssm:GetParameter'],
			resources: [
				ssmArn(thisStack, `/${stage}/${stack}/${app}/*`),
				ssmArn(
					thisStack,
					`/${stage}/deploy/riff-raff/external-database-access-security-group`,
				),
				ssmArn(thisStack, '/account/vpc/primary/subnets/private'),
			],
		});

		const ecsPolicy = new PolicyStatement({
			effect: Effect.ALLOW,
			actions: ['ecs:RunTask', 'ecs:List*', 'ecs:Describe*'],
			resources: [cloudqueryTasksArn],
		});

		cqClusterCliRole.addToPolicy(ecsPolicy);
		cqClusterCliRole.addToPolicy(SSMPolicy);
	}
}
