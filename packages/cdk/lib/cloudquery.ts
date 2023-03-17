import fs from 'fs';
import type { GuAutoScalingGroupProps } from '@guardian/cdk/lib/constructs/autoscaling';
import { GuAutoScalingGroup } from '@guardian/cdk/lib/constructs/autoscaling';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuVpc, SubnetType } from '@guardian/cdk/lib/constructs/ec2';
import type { App } from 'aws-cdk-lib';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	UserData,
} from 'aws-cdk-lib/aws-ec2';
import type { DatabaseInstanceProps } from 'aws-cdk-lib/aws-rds';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';

export class CloudQuery extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const app = props.app ?? 'cloudquery';
		const vpc = GuVpc.fromIdParameter(this, 'vpc');
		const privateSubnets = GuVpc.subnetsFromParameter(this, {
			type: SubnetType.PRIVATE,
			app,
		});

		const userData = UserData.forLinux();

		const awsYaml = fs.readFileSync(__dirname + '/cloudquery/aws.yaml', {
			encoding: 'utf-8',
		});
		const postgresqlYaml = fs.readFileSync(
			__dirname + '/cloudquery/postgresql.yaml',
			{
				encoding: 'utf-8',
			},
		);

		userData.addCommands(
			'# Install Cloudquery',
			`curl -L https://github.com/cloudquery/cloudquery/releases/download/cli-v2.5.1/cloudquery_linux_arm64 -o cloudquery`,
			`chmod a+x cloudquery`,
			'# Add configuration files',
			`cat > aws.yaml << EOL
${awsYaml}
EOL`,
			`cat > postgresql.yaml << EOL
${postgresqlYaml}
EOL`,
			`./cloudquery sync aws.yml postgresql.yml`, // TODO cron this and ship logs.
		);

		const asgProps: GuAutoScalingGroupProps = {
			app,
			vpc: vpc,
			vpcSubnets: { subnets: privateSubnets },
			minimumInstances: 1,
			userData: userData,
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			imageRecipe: 'arm64-jammy-java11-deploy-infrastructure',
		};

		const asg = new GuAutoScalingGroup(this, 'asg', asgProps);

		const dbProps: DatabaseInstanceProps = {
			engine: DatabaseInstanceEngine.POSTGRES,
			vpc,
			vpcSubnets: { subnets: privateSubnets },
			iamAuthentication: true,
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
		};

		const db = new DatabaseInstance(this, 'PostgresInstance1', dbProps);

		db.connections.allowDefaultPortFrom(asg);
	}
}
