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
	UserData,
} from 'aws-cdk-lib/aws-ec2';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';

export class GithubLens extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);
		// EC2 ASG - with Cloudquery + config
		// Postgres (RDS)
		const vpc = GuVpc.fromIdParameter(this, 'vpc');

		const userData = UserData.forLinux();
		const awsYaml = fs.readFileSync('cloudquery/aws.yaml', {
			encoding: 'utf-8',
		});
		const postgresYaml = fs.readFileSync('cloudquery/postgres.yaml', {
			encoding: 'utf-8',
		});

		userData.addCommands(
			'# Install Cloudquery',
			`curl -L https://github.com/cloudquery/cloudquery/releases/download/cli-v2.5.1/cloudquery_linux_arm64 -o cloudquery`,
			`chmod a+x cloudquery`,

			'# Add configuration files',
			`echo ${awsYaml} > aws.yaml`,
			`echo ${postgresYaml} > postgres.yaml`,
		);

		const asgProps: AutoScalingGroupProps = {
			vpc: vpc,
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			userData: userData,
		};

		const asg = new AutoScalingGroup(this, 'asg', asgProps);

		const db = new DatabaseInstance(this, 'PostgresInstance1', {
			engine: DatabaseInstanceEngine.POSTGRES,
			vpc,
			iamAuthentication: true,
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
		});

		db.grantConnect(asg); // TODO check if actually works - see docstring link.
	}
}
