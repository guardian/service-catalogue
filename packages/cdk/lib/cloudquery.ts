import fs from 'fs';
import type { GuAutoScalingGroupProps } from '@guardian/cdk/lib/constructs/autoscaling';
import { GuAutoScalingGroup } from '@guardian/cdk/lib/constructs/autoscaling';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import {
	GuSecurityGroup,
	GuVpc,
	SubnetType,
} from '@guardian/cdk/lib/constructs/ec2';
import type { App } from 'aws-cdk-lib';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	Port,
	UserData,
} from 'aws-cdk-lib/aws-ec2';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { DatabaseInstanceProps } from 'aws-cdk-lib/aws-rds';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';
import {
	ParameterDataType,
	ParameterTier,
	StringParameter,
} from 'aws-cdk-lib/aws-ssm';

export class CloudQuery extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const { stage, stack } = this;
		const app = props.app ?? 'cloudquery';

		const vpc = GuVpc.fromIdParameter(this, 'vpc');
		const privateSubnets = GuVpc.subnetsFromParameter(this, {
			type: SubnetType.PRIVATE,
			app,
		});

		const port = 5432;

		const dbProps: DatabaseInstanceProps = {
			engine: DatabaseInstanceEngine.POSTGRES,
			port,
			vpc,
			vpcSubnets: { subnets: privateSubnets },
			iamAuthentication: true,
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
		};

		const db = new DatabaseInstance(this, 'PostgresInstance1', dbProps);
		const dbSecret = db.secret?.secretName;

		if (!dbSecret) {
			throw new Error('DB Secret is missing');
		}

		const applicationToPostgresSecurityGroup = new GuSecurityGroup(
			this,
			'PostgresAccessSecurityGroup',
			{ app, vpc },
		);

		// Used by downstream services that read CloudQuery data, namely Grafana.
		new StringParameter(this, 'PostgresAccessSecurityGroupParam', {
			parameterName: `/${stage}/${stack}/${app}/postgres-access-security-group`,
			simpleName: false,
			stringValue: applicationToPostgresSecurityGroup.securityGroupId,
			tier: ParameterTier.STANDARD,
			dataType: ParameterDataType.TEXT,
		});

		db.connections.allowFrom(
			applicationToPostgresSecurityGroup,
			Port.tcp(port),
		);

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
			`set -xe`,
			`curl -L https://github.com/cloudquery/cloudquery/releases/download/cli-v2.5.1/cloudquery_linux_arm64 -o cloudquery`,
			`chmod a+x cloudquery`,
			'# Add configuration files',
			`cat > aws.yaml << EOL
${awsYaml}
EOL`,
			`cat > postgresql.yaml << EOL
${postgresqlYaml}
EOL`,
			`# Replace password + db host`,
			`HOST=$(aws secretsmanager get-secret-value --secret-id ${dbSecret} --region ${this.region} | jq -r '.SecretString|fromjson|.host')`,
			`sed -i "s/£HOST/$HOST/g" postgresql.yaml`,
			`PASSWORD=$(aws secretsmanager get-secret-value --secret-id ${dbSecret} --region ${this.region} | jq -r '.SecretString|fromjson|.password|@uri')`,
			`sed -i "s/£PASSWORD/$PASSWORD/g" postgresql.yaml`,
			`echo "#!/bin/sh\n/cloudquery sync /aws.yaml /postgresql.yaml" > /etc/cron.daily/cloudQuery`,
			`chmod +x /etc/cron.daily/cloudQuery`, // TODO ship logs.
		);

		const asgProps: GuAutoScalingGroupProps = {
			app,
			vpc: vpc,
			vpcSubnets: { subnets: privateSubnets },
			minimumInstances: 1,
			userData: userData,
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			imageRecipe: 'arm64-jammy-java11-deploy-infrastructure',
			additionalSecurityGroups: [applicationToPostgresSecurityGroup],
		};

		const asg = new GuAutoScalingGroup(this, 'asg', asgProps);

		asg.role.addManagedPolicy(
			ManagedPolicy.fromManagedPolicyArn(
				this,
				'read-all-policy',
				'arn:aws:iam::aws:policy/ReadOnlyAccess',
			),
		);

		// See https://github.com/cloudquery/iam-for-aws-orgs/ and
		// https://github.com/cloudquery/iam-for-aws-orgs/blob/d44ffe5509ba8a6c84c31dcc1dac7f475a5099e3/template.yml#L95.
		asg.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.DENY,
				resources: ['*'],
				actions: [
					'cloudformation:GetTemplate',
					'dynamodb:GetItem',
					'dynamodb:BatchGetItem',
					'dynamodb:Query',
					'dynamodb:Scan',
					'ec2:GetConsoleOutput',
					'ec2:GetConsoleScreenshot',
					'ecr:BatchGetImage',
					'ecr:GetAuthorizationToken',
					'ecr:GetDownloadUrlForLayer',
					'kinesis:Get*',
					'lambda:GetFunction',
					'logs:GetLogEvents',
					's3:GetObject',
					'sdb:Select*',
					'sqs:ReceiveMessage',
				],
			}),
		);

		db.secret.grantRead(asg);
	}
}
