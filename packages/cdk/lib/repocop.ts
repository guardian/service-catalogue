import { GuScheduledLambda, type GuScheduledLambdaProps } from '@guardian/cdk';
import type {
	GuLambdaErrorPercentageMonitoringProps,
	NoMonitoring,
} from '@guardian/cdk/lib/constructs/cloudwatch';
import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import { Duration } from 'aws-cdk-lib';
import type { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import type { Schedule } from 'aws-cdk-lib/aws-events';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import type { ITopic } from 'aws-cdk-lib/aws-sns';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

export class Repocop {
	constructor(
		guStack: GuStack,
		schedule: Schedule,
		anghammaradTopic: ITopic,
		cloudqueryDB: DatabaseInstance,
		monitoringConfiguration:
			| NoMonitoring
			| GuLambdaErrorPercentageMonitoringProps,
		vpc: IVpc,
		interactiveMonitorTopic: Topic,
		dbSecurityGroup: SecurityGroup,
		repocopGithubSecret: Secret,
		gitHubOrg: string,
		digestCutOffInDays: number,
	) {
		const dependencyGraphIntegratorInputTopic = new Topic(
			guStack,
			`dependency-graph-integrator-input-topic-${guStack.stage}`,
			{
				displayName: 'Dependency Graph Integrator Input Topic',
			},
		);

		const repocopLambdaProps: GuScheduledLambdaProps = {
			app: 'repocop',
			architecture: Architecture.ARM_64,
			fileName: 'repocop.zip',
			handler: 'index.main',
			memorySize: 2048,
			monitoringConfiguration,
			rules: [{ schedule }],
			runtime: Runtime.NODEJS_24_X,
			environment: {
				ANGHAMMARAD_SNS_ARN: anghammaradTopic.topicArn,
				DATABASE_HOSTNAME: cloudqueryDB.dbInstanceEndpointAddress,
				QUERY_LOGGING: 'false', // Set this to 'true' to enable SQL query logging
				INTERACTIVE_MONITOR_TOPIC_ARN: interactiveMonitorTopic.topicArn,
				GITHUB_APP_SECRET: repocopGithubSecret.secretArn,
				INTERACTIVES_COUNT: guStack.stage === 'PROD' ? '40' : '3',
				DEPENDENCY_GRAPH_INPUT_TOPIC_ARN:
					dependencyGraphIntegratorInputTopic.topicArn,
				GITHUB_ORG: gitHubOrg,
				CUT_OFF_IN_DAYS: digestCutOffInDays.toString(),
				BRANCH_PROTECTION_ENABLED: 'true',
				NODE_EXTRA_CA_CERTS: '/var/runtime/ca-cert.pem',
			},
			vpc,
			securityGroups: [dbSecurityGroup],
			timeout: Duration.minutes(5),
		};

		const repocopLambda = new GuScheduledLambda(
			guStack,
			'repocop',
			repocopLambdaProps,
		);

		const policyStatement = new PolicyStatement({
			actions: ['cloudwatch:PutMetricData'],
			resources: ['*'],
			conditions: {
				StringEquals: {
					'cloudwatch:namespace': 'repocop',
				},
			},
		});

		cloudqueryDB.grantConnect(repocopLambda, 'repocop');

		repocopGithubSecret.grantRead(repocopLambda);
		anghammaradTopic.grantPublish(repocopLambda);
		interactiveMonitorTopic.grantPublish(repocopLambda);
		dependencyGraphIntegratorInputTopic.grantPublish(repocopLambda);
		repocopLambda.addToRolePolicy(policyStatement);

		const dependencyGraphIntegratorLambda =
			createDependencyGraphIntegratorLambda(
				guStack,
				vpc,
				'dependency-graph-integrator',
				gitHubOrg,
			);

		dependencyGraphIntegratorInputTopic.addSubscription(
			new LambdaSubscription(dependencyGraphIntegratorLambda, {}),
		);
	}
}

function createDependencyGraphIntegratorLambda(
	guStack: GuStack,
	vpc: IVpc,
	app: `${string}-integrator`,
	gitHubOrg: string,
): GuLambdaFunction {
	const baseLambdaProps = {
		app,
		architecture: Architecture.ARM_64,
		fileName: `${app}.zip`,
		handler: 'index.handler',
		memorySize: 1024,
		runtime: Runtime.NODEJS_24_X,
		vpc,
		timeout: Duration.minutes(5),
		environment: {
			GITHUB_ORG: gitHubOrg,
		},
	};

	if (guStack.stage === 'PROD') {
		const githubAppSecret = new Secret(guStack, `${app}-github-app-auth`, {
			secretName: `/${guStack.stage}/${guStack.stack}/service-catalogue/${app}-github-app-secret`,
		});

		const lambda = new GuLambdaFunction(guStack, app, {
			...baseLambdaProps,
			environment: {
				...baseLambdaProps.environment,
				GITHUB_APP_SECRET: githubAppSecret.secretArn,
			},
			errorPercentageMonitoring: {
				toleratedErrorPercentage: 0,
				snsTopicName: 'devx-alerts',
			},
		});

		githubAppSecret.grantRead(lambda);

		return lambda;
	} else {
		return new GuLambdaFunction(guStack, app, baseLambdaProps);
	}
}
