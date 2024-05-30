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

interface RefreshMaterializedViewLambdaProps {
	vpc: IVpc;
	db: DatabaseInstance;
	dbAccess: GuSecurityGroup;
}

export function addRefreshMaterializedViewLambda(
	scope: GuStack,
	props: RefreshMaterializedViewLambdaProps,
) {
	const app = 'refresh-materialized-view';

	const { vpc, dbAccess, db } = props;

	const lambda = new GuLambdaFunction(scope, 'RefreshMaterializedView', {
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
	// TODO pass the tasks in as a prop
	const awsTasks = scope.node.children
		.filter((_): _ is ScheduledFargateTask => _ instanceof ScheduledFargateTask)
		.filter((_) => _.taskDefinition.family.includes('Aws'));

	if (awsTasks.length === 0) {
		// This is only seen at synth time. It doesn't impact running infrastructure.
		throw new Error(`Could not find any 'Aws' tasks`);
	}

	awsTasks.forEach((task) => {
		// Invoke the lambda when the task has completed successfully
		new Rule(scope, `${app}-lambda-trigger-${task.taskDefinition.family}`, {
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
	});

	db.grantConnect(lambda, 'refresh_materialized_view');
}
