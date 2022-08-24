import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuScheduledLambda } from '@guardian/cdk/lib/patterns/scheduled-lambda';
import type { App } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';

export class CdkMetadata extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const bucket = new Bucket(this, 'data-bucket');

		const lambda = new GuScheduledLambda(this, 'lambda', {
			app: 'cdk-metadata',
			rules: [
				{
					schedule: Schedule.rate(Duration.days(1)),
					description: 'Run daily.',
				},
			],
			runtime: Runtime.GO_1_X,
			handler: 'main',
			fileName: 'lambda.zip',
			monitoringConfiguration: { noMonitoring: true }, // FIXME
			environment: {
				BUCKET: bucket.bucketName,
			},
			timeout: Duration.minutes(15),
		});

		lambda.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: [
					`arn:aws:dynamodb:eu-west-1:${this.account}:table/config-deploy`,
				],
				actions: ['dynamodb:Query'],
			}),
		);

		lambda.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: [
					'arn:aws:iam::*:role/*Prism*',
					'arn:aws:iam::*:role/*prism*',
				],
				actions: ['sts:AssumeRole'],
			}),
		);

		lambda.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: [`${bucket.bucketArn}/*`],
				actions: ['s3:PutObject'],
			}),
		);
	}
}
