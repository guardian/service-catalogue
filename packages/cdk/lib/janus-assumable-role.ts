import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import {
	GuJanusAssumableRole,
	type GuJanusAssumableRoleProps,
} from '@guardian/cdk/lib/constructs/iam';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class JanusAssumableRoles {
	constructor(thisStack: GuStack, cloudqueryTasksArn: string) {
		const { stack, stage, app } = thisStack;
		const janusRoleProps: GuJanusAssumableRoleProps = {
			janusPermission: `run-cloudquery-tasks-${stage.toLowerCase()}`,
			janusName: `Run CloudQuery Cluster ${stage} Role`,
			janusDescription: `Role for running CloudQuery tasks in the ${stage} environment.`,
		};

		const role = new GuJanusAssumableRole(thisStack, janusRoleProps);

		const SSMPolicy = new PolicyStatement({
			effect: Effect.ALLOW,
			actions: ['ssm:GetParameter'],
			resources: [
				thisStack.formatArn({
					service: 'ssm',
					resource: 'parameter',
					resourceName: `/${stage}/${stack}/${app}/*`,
				}),
				thisStack.formatArn({
					service: 'ssm',
					resource: 'parameter',
					resourceName: `/${stage}/deploy/riff-raff/external-database-access-security-group`,
				}),
				thisStack.formatArn({
					service: 'ssm',
					resource: 'parameter',
					resourceName: '/account/vpc/primary/subnets/private',
				}),
			],
		});

		role.addToPolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				actions: ['ecs:RunTask', 'ecs:List*', 'ecs:Describe*'],
				resources: [cloudqueryTasksArn],
			}),
		);
		role.addToPolicy(SSMPolicy);
	}
}
