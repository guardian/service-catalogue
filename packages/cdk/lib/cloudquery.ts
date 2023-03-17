import fs from 'fs';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuVpc } from '@guardian/cdk/lib/constructs/ec2';
import type { App } from 'aws-cdk-lib';
import type { AutoScalingGroupProps } from 'aws-cdk-lib/aws-autoscaling';
import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	Port,
	UserData,
} from 'aws-cdk-lib/aws-ec2';
import type { DatabaseInstanceProps } from 'aws-cdk-lib/aws-rds';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';

export class CloudQuery extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);
		// EC2 ASG - with Cloudquery + config
		const vpc = GuVpc.fromIdParameter(this, 'vpc');

		const userData = UserData.forLinux();

		const awsYaml = fs.readFileSync('cloudquery/aws.yaml', {
			encoding: 'utf-8',
		});
		// const postgresYaml = fs.readFileSync('cloudquery/postgres.yaml', {
		// 	encoding: 'utf-8',
		// });

		userData.addCommands(
			'# Install Cloudquery',
			`curl -L https://github.com/cloudquery/cloudquery/releases/download/cli-v2.5.1/cloudquery_linux_arm64 -o cloudquery`,
			`chmod a+x cloudquery`,

			'# Add configuration files',
			`echo ${awsYaml} > aws.yaml`,
			//`echo ${postgresYaml} > postgres.yaml`, //this file needs to be committed
			`./cloudquery sync aws.yml postgres.yml`,
		);

		const asgProps: AutoScalingGroupProps = {
			vpc: vpc,
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			userData: userData,
		};

		const asg = new AutoScalingGroup(this, 'asg', asgProps);

		//allow ASG to connect to GitHub
		asg.connections.allowFromAnyIpv4(Port.tcp(443));

		const dbProps: DatabaseInstanceProps = {
			engine: DatabaseInstanceEngine.POSTGRES,
			vpc,
			iamAuthentication: true,
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
		};

		const db = new DatabaseInstance(this, 'PostgresInstance1', dbProps);

		db.connections.allowDefaultPortFrom(asg);
	}
}
