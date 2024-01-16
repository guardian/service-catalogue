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
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Topic } from 'aws-cdk-lib/aws-sns';
import type { ITopic } from 'aws-cdk-lib/aws-sns';
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
	) {
		const snykIntegratorInputTopic = new Topic(
			guStack,
			`snyk-integrator-input-topic-${guStack.stage}`,
			{
				displayName: 'Snyk Integrator Input Topic',
			},
		);

		const repocopLampdaProps: GuScheduledLambdaProps = {
			app: 'repocop',
			fileName: 'repocop.zip',
			handler: 'index.main',
			memorySize: 1024,
			monitoringConfiguration,
			rules: [{ schedule }],
			runtime: Runtime.NODEJS_20_X,
			environment: {
				ANGHAMMARAD_SNS_ARN: anghammaradTopic.topicArn,
				DATABASE_HOSTNAME: cloudqueryDB.dbInstanceEndpointAddress,
				QUERY_LOGGING: 'false', // Set this to 'true' to enable SQL query logging
				INTERACTIVE_MONITOR_TOPIC_ARN: interactiveMonitorTopic.topicArn,
				GITHUB_APP_SECRET: repocopGithubSecret.secretArn,
				INTERACTIVES_COUNT: guStack.stage === 'PROD' ? '40' : '3',
			},
			vpc,
			securityGroups: [dbSecurityGroup],
			timeout: Duration.minutes(5),
		};

		const repocopLambda = new GuScheduledLambda(
			guStack,
			'repocop',
			repocopLampdaProps,
		);

		//allow repocop to create and put metrics
		const policyStatement = new PolicyStatement({
			actions: ['cloudwatch:PutMetricData'],
			resources: ['*'],
		});

		cloudqueryDB.grantConnect(repocopLambda, 'repocop');

		repocopGithubSecret.grantRead(repocopLambda);
		anghammaradTopic.grantPublish(repocopLambda);
		interactiveMonitorTopic.grantPublish(repocopLambda);
		repocopLambda.addToRolePolicy(policyStatement);

		const snykIntegratorSecret = new Secret(
			guStack,
			`snyk-integrator-github-app-auth`,
			{
				secretName: `/${guStack.stage}/${guStack.stack}/service-catalogue/snyk-integrator-github-app-secret`,
			},
		);

		const snykIntegatorLambda: GuLambdaFunction = new GuLambdaFunction(
			guStack,
			'snyk-integrator',
			{
				app: 'snyk-integrator',
				fileName: 'snyk-integrator.zip',
				handler: 'index.handler',
				memorySize: 1024,
				runtime: Runtime.NODEJS_20_X,
				environment: {
					GITHUB_APP_SECRET: snykIntegratorSecret.secretArn,
				},
				vpc,
				timeout: Duration.minutes(5),
			},
		);

		snykIntegratorSecret.grantRead(snykIntegatorLambda);
		snykIntegratorInputTopic.addSubscription(
			new LambdaSubscription(snykIntegatorLambda, {}),
		);
	}
}
