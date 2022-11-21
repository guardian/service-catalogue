import { AccessScope } from '@guardian/cdk/lib/constants';
import {
	GuAnghammaradTopicParameter,
	GuDistributionBucketParameter,
	GuStack,
} from '@guardian/cdk/lib/constructs/core';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import { GuEc2App } from '@guardian/cdk/lib/patterns/ec2-app';
import { CfnParameter, Duration } from 'aws-cdk-lib';
import type { App } from 'aws-cdk-lib';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	Peer,
} from 'aws-cdk-lib/aws-ec2';
import { Bucket } from 'aws-cdk-lib/aws-s3';

interface ServicesApiProps extends GuStackProps {
	domainName: string;
}

export class ServicesApi extends GuStack {
	constructor(scope: App, id: string, props: ServicesApiProps) {
		super(scope, id, props);

		const app = 'services-api';
		const keyPrefix = `${this.stack}/${this.stage}/${app}`;
		const distBucket =
			GuDistributionBucketParameter.getInstance(this).valueAsString;

		// Access to the temp Galaxies bucket until we can hit the API directly.
		const galaxiesBucketParam = new CfnParameter(this, 'galaxies-bucket-name', {
			description: 'Bucket name for Galaxies data.',
			default: `/${this.stage}/${this.stack}/${app}/galaxies-bucket-name`,
			type: 'AWS::SSM::Parameter::Value<String>',
		});

		const galaxiesBucket = Bucket.fromBucketName(
			this,
			'galaxies-bucket',
			galaxiesBucketParam.valueAsString,
		);

		const cloudformationLensUrlParam = new CfnParameter(
			this,
			'cloudformation-lens-url',
			{
				description:
					'Cloudformation Lens URL including protocol but not trailing slash.',
				default: `/${this.stage}/${this.stack}/${app}/cloudformation-lens-url`,
				type: 'AWS::SSM::Parameter::Value<String>',
			},
		);

		const githubLensUrlParam = new CfnParameter(this, 'github-lens-url', {
			description: 'Github Lens URL including protocol but not trailing slash.',
			default: `/${this.stage}/${this.stack}/${app}/github-lens-url`,
			type: 'AWS::SSM::Parameter::Value<String>',
		});

		const applicationPort = 8900;
		const handler = 'handler.js';

		const userData = `#!/bin/bash -ev
cat << EOF > /etc/systemd/system/${app}.service
[Unit]
Description=Github Lens API

[Service]
Environment="PORT=${applicationPort}"
Environment="STAGE=${props.stage}"
Environment="GALAXIES_BUCKET_NAME=${galaxiesBucketParam.valueAsString}"
Environment="CLOUDFORMATION_LENS_URL=${cloudformationLensUrlParam.valueAsString}"
Environment="GITHUB_LENS_URL=${githubLensUrlParam.valueAsString}"
ExecStart=/usr/bin/node /${handler}

[Install]
WantedBy=multi-user.target
EOF

aws s3 cp s3://${distBucket}/${keyPrefix}/${app}.zip ${app}.zip
unzip ${app}.zip
chmod +x /${handler}
systemctl start ${app}
`;

		const ec2 = new GuEc2App(this, {
			app,
			access: {
				scope: AccessScope.INTERNAL,
				cidrRanges: [Peer.ipv4('10.0.0.0/8')], // TODO replace with Google auth once integrated to this pattern.
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

		galaxiesBucket.grantRead(ec2.autoScalingGroup);

		new GuCname(this, 'DNS', {
			app,
			domainName: props.domainName,
			resourceRecord: ec2.loadBalancer.loadBalancerDnsName,
			ttl: Duration.hours(1),
		});
	}
}
