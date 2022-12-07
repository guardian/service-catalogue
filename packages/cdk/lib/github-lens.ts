import { AccessScope } from '@guardian/cdk/lib/constants';
import {
	GuAnghammaradTopicParameter,
	GuDistributionBucketParameter,
	GuStack,
	GuStringParameter,
} from '@guardian/cdk/lib/constructs/core';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import { GuS3Bucket } from '@guardian/cdk/lib/constructs/s3';
import { GuEc2App } from '@guardian/cdk/lib/patterns/ec2-app';
import { GuScheduledLambda } from '@guardian/cdk/lib/patterns/scheduled-lambda';
import { Duration } from 'aws-cdk-lib';
import type { App } from 'aws-cdk-lib';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	Peer,
} from 'aws-cdk-lib/aws-ec2';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

interface GithubLensProps extends GuStackProps {
	domainName: string;
}

export class GithubLens extends GuStack {
	constructor(scope: App, id: string, props: GithubLensProps) {
		super(scope, id, props);

		const app = 'github-lens';
		const dataFetcherApp = 'github-data-fetcher';
		const apiApp = 'github-lens-api';

		// S3 bucket to store the aggregated and transformed Github data.

		const dataBucket = new GuS3Bucket(this, `${app}-data-bucket`, {
			bucketName: `github-lens-data-${this.stage.toLowerCase()}`,
			app,
		});

		// Some parameters and encryption keys

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

		// The API EC2 app...

		const keyPrefix = `${this.stack}/${this.stage}/${apiApp}`;
		const distBucket =
			GuDistributionBucketParameter.getInstance(this).valueAsString;

		const applicationPort = 8900;
		const handler = 'handler.js';

		const userData = `#!/bin/bash -ev
cat << EOF > /etc/systemd/system/${apiApp}.service
[Unit]
Description=Github Lens API

[Service]
Environment="DATA_BUCKET_NAME=${dataBucket.bucketName}"
Environment="PORT=${applicationPort}"
Environment="STAGE=${props.stage}"
ExecStart=/usr/bin/node /${handler}

[Install]
WantedBy=multi-user.target
EOF

aws s3 cp s3://${distBucket}/${keyPrefix}/${apiApp}.zip ${apiApp}.zip
unzip ${apiApp}.zip
chmod +x /${handler}
systemctl start ${apiApp}
`;

		const ec2 = new GuEc2App(this, {
			app: apiApp,
			access: {
				scope: AccessScope.INTERNAL,
				cidrRanges: [Peer.ipv4('10.0.0.0/8')], // VPC and other private Guardian IPs
			},
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.NANO),
			applicationPort,
			monitoringConfiguration: {
				snsTopicName:
					GuAnghammaradTopicParameter.getInstance(this).valueAsString,
				unhealthyInstancesAlarm: true,
				http5xxAlarm: {
					tolerated5xxPercentage: 1,
					numberOfMinutesAboveThresholdBeforeAlarm: 60,
				},
			},
			certificateProps: { domainName: props.domainName },
			scaling: { minimumInstances: 1, maximumInstances: 2 },
			userData: userData,
			imageRecipe: 'arm64-focal-node16-devx',
			applicationLogging: { enabled: true },
		});

		new GuCname(this, 'DNS', {
			app: apiApp,
			domainName: props.domainName,
			resourceRecord: ec2.loadBalancer.loadBalancerDnsName,
			ttl: Duration.hours(1),
		});

		// The scheduled lambda...

		const scheduledLambda = new GuScheduledLambda(
			this,
			`${dataFetcherApp}-lambda`,
			{
				app: dataFetcherApp,
				runtime: Runtime.NODEJS_16_X,
				memorySize: 512,
				handler: 'handler.main',
				fileName: `${dataFetcherApp}.zip`,
				monitoringConfiguration: {
					toleratedErrorPercentage: 0,
					snsTopicName: 'devx-alerts',
				},
				rules: [{ schedule: Schedule.cron({ minute: '0', hour: '7' }) }],
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

		dataBucket.grantRead(ec2.autoScalingGroup);
		dataBucket.grantReadWrite(scheduledLambda);
	}
}
