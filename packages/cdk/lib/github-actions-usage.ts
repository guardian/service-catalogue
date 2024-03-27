import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import { Duration } from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import { ScheduledFargateTask } from 'aws-cdk-lib/aws-ecs-patterns';
import { Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';

interface GithubActionsUsageProps {
	vpc: IVpc;
	db: DatabaseInstance;
	dbAccess: GuSecurityGroup;
}

export function addGithubActionsUsageLambda(
	scope: GuStack,
	props: GithubActionsUsageProps,
) {
	const app = 'github-actions-usage';

	const { vpc, dbAccess, db } = props;

	const lambda = new GuLambdaFunction(scope, 'GithubActionsUsage', {
		app,
		vpc,
		architecture: Architecture.ARM_64,
		securityGroups: [dbAccess],
		fileName: `${app}.zip`,
		handler: 'index.main',
		environment: {
			DATABASE_HOSTNAME: db.dbInstanceEndpointAddress,
			QUERY_LOGGING: 'false', // Set this to 'true' to enable SQL query logging
		},
		runtime: Runtime.NODEJS_20_X,
		timeout: Duration.minutes(10),
	});

	// This sort of lookup is a bit fragile!
	// TODO pass the task in as a prop
	const task = scope.node.children.find(
		(_) =>
			_ instanceof ScheduledFargateTask &&
			_.taskDefinition.family.includes('GitHubRepositories'),
	) as ScheduledFargateTask | undefined;

	if (!task) {
		throw new Error('Could not find the GitHubRepositories task');
	}

	// Invoke the lambda when the GitHubRepositories task has completed successfully
	new Rule(scope, `${app}-lambda-trigger`, {
		targets: [new LambdaFunction(lambda)],
		enabled: true,
		eventPattern: {
			source: ['aws.ecs'],
			detailType: ['ECS Task State Change'],

			// See https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_Task.html
			detail: {
				clusterArn: [task.cluster.clusterArn],
				taskDefinitionArn: [task.taskDefinition.taskDefinitionArn],
				lastStatus: ['STOPPED'],
				stopCode: ['EssentialContainerExited'], // The CloudQuery container is the "essential" one
				'containers.exitCode': [{ numeric: ['=', 0] }],
				'containers.name': [
					task.taskDefinition.defaultContainer?.containerName,
				],
			},
		},
	});

	db.grantConnect(lambda, 'github_actions_usage');
}
