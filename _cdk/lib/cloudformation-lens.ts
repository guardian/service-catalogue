import { AccessScope } from '@guardian/cdk/lib/constants';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import {
	GuAnghammaradTopicParameter,
	GuDistributionBucketParameter,
	GuStack,
} from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import { GuEc2App } from '@guardian/cdk/lib/patterns/ec2-app';
import { GuardianPublicNetworks } from '@guardian/private-infrastructure-config';
import { Duration } from 'aws-cdk-lib';
import type { App } from 'aws-cdk-lib';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	Peer,
} from 'aws-cdk-lib/aws-ec2';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Bucket } from 'aws-cdk-lib/aws-s3';

export class CloudFormationLens extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const bucket = new Bucket(this, 'data-bucket', {
			lifecycleRules: [{ expiration: Duration.days(30) }],
		});

		const name = 'cloudformation-lens';
		const domainName = `${name}.gutools.co.uk`;
		const keyPrefix = `${this.stack}/${this.stage}/${name}`;

		const distBucket =
			GuDistributionBucketParameter.getInstance(this).valueAsString;

		const userData = `#!/bin/bash -ev
cat << EOF > /etc/systemd/system/${name}.service
[Unit]
Description=CDK Metadata

[Service]
Environment="BUCKET=${bucket.bucketName}"
ExecStart=/${name}

[Install]
WantedBy=multi-user.target
EOF

aws s3 cp s3://${distBucket}/${keyPrefix}/${name} /${name}
chmod +x /${name}
systemctl start ${name}
`;

		const ec2 = new GuEc2App(this, {
			app: name,
			access: {
				scope: AccessScope.INTERNAL,
				cidrRanges: [Peer.ipv4('10.0.0.0/8')], // VPC and other private Guardian IPs
			},
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.NANO),
			applicationPort: 8900,
			monitoringConfiguration: {
				snsTopicName:
					GuAnghammaradTopicParameter.getInstance(this).valueAsString,
				unhealthyInstancesAlarm: true,
				http5xxAlarm: {
					tolerated5xxPercentage: 1,
					numberOfMinutesAboveThresholdBeforeAlarm: 60,
				},
			},
			certificateProps: { domainName },
			scaling: { minimumInstances: 1, maximumInstances: 2 },
			userData: userData,
			imageRecipe: 'arm64-bionic-java11-deploy-infrastructure', // TODO should we create a minimal Amigo recipe for this?
			applicationLogging: { enabled: true },
		});

		ec2.autoScalingGroup.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: ['arn:aws:iam::*:role/cloudformation-read-access'],
				actions: ['sts:AssumeRole'],
			}),
		);

		ec2.autoScalingGroup.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
				actions: ['s3:PutObject', 's3:GetObject', 's3:ListBucket'],
			}),
		);

		new GuCname(this, 'cname', {
			app: name,
			domainName,
			resourceRecord: ec2.loadBalancer.loadBalancerDnsName,
			ttl: Duration.hours(1),
		});
	}
}
