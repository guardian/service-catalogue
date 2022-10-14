import { GuApiLambda, GuScheduledLambda } from '@guardian/cdk';
import { GuCertificate } from '@guardian/cdk/lib/constructs/acm';
import type { NoMonitoring } from '@guardian/cdk/lib/constructs/cloudwatch';
import { GuStack, GuStringParameter } from '@guardian/cdk/lib/constructs/core';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import { GuS3Bucket } from '@guardian/cdk/lib/constructs/s3';
import type { App } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export class GithubLens extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps, domainName: string) {
		super(scope, id, props);

		const app = 'github-lens';

		const dataBucket = new GuS3Bucket(this, `${app}-data-bucket`, {
			app,
		});

		const kmsKeyAlias = `${this.stage}/${this.stack}/${app}`;
		const kmsKey = new Key(this, kmsKeyAlias, {
			enableKeyRotation: true,
		});

		const kmsDecryptPolicy = new PolicyStatement({
			effect: Effect.ALLOW,
			actions: ['kms:Decrypt'],
			resources: [kmsKey.keyArn],
		});

		const paramPathBase = `/${this.stage}/${this.stack}/${app}`;
		const repoFetcherApp = 'repo-fetcher';
		const apiApp = 'github-lens-api';

		const githubAppId = new GuStringParameter(this, 'github-app-id', {
			default: `${paramPathBase}/github-app-id`,
			description:
				'(From SSM) The GitHub app ID of the app used to authenticate github-lens',
			fromSSM: true,
		});

		const githubInstallationId = new GuStringParameter(
			this,
			'github-installation-id',
			{
				default: `${paramPathBase}/github-installation-id`,
				description:
					'(From SSM) The GitHub installation ID of the app used to authenticate github-lens in the Guardian org',
				fromSSM: true,
			},
		);

		const githubPrivateKey = new GuStringParameter(this, 'github-private-key', {
			default: `${paramPathBase}/github-private-key`,
			noEcho: true,
			description:
				'(From SSM) (KMS encrypted) The private key of the app used to authenticate github-lens in the Guardian org',
			fromSSM: true,
		});

		const noMonitoring: NoMonitoring = { noMonitoring: true };

		const apiLambda = new GuApiLambda(this, `${apiApp}-lambda`, {
			fileName: `${apiApp}.zip`,
			handler: 'handler.main',
			runtime: Runtime.NODEJS_16_X,
			monitoringConfiguration: noMonitoring,
			app: apiApp,
			api: {
				id: 'github-lens',
				description: 'API that proxies all requests to Lambda',
			},
		});

		const domain = apiLambda.api.addDomainName('domain', {
			domainName: domainName,
			certificate: new GuCertificate(this, {
				app: app,
				domainName: domainName,
			}),
		});

		new GuCname(this, 'DNS', {
			app: app,
			ttl: Duration.days(1),
			domainName: domainName,
			resourceRecord: domain.domainNameAliasDomainName,
		});

		const scheduledLambda = new GuScheduledLambda(
			this,
			`${repoFetcherApp}-lambda`,
			{
				app: repoFetcherApp,
				runtime: Runtime.NODEJS_16_X,
				memorySize: 512,
				handler: 'handler.main',
				fileName: `${repoFetcherApp}.zip`,
				monitoringConfiguration: {
					toleratedErrorPercentage: 0,
					snsTopicName: 'devx-alerts',
				},
				rules: [{ schedule: Schedule.cron({ minute: '0', hour: '8' }) }],
				timeout: Duration.seconds(300),
				environment: {
					STAGE: this.stage,
					KMS_KEY_ID: kmsKey.keyId,
					GITHUB_APP_ID: githubAppId.valueAsString,
					GITHUB_APP_PRIVATE_KEY: githubPrivateKey.valueAsString,
					GITHUB_APP_INSTALLATION_ID: githubInstallationId.valueAsString,
					DATA_BUCKET_NAME: dataBucket.bucketName,
				},
				initialPolicy: [kmsDecryptPolicy],
			},
		);

		dataBucket.grantRead(apiLambda);
		dataBucket.grantReadWrite(scheduledLambda);
	}
}
