import { MetadataKeys } from '@guardian/cdk/lib/constants';
import type { GuAutoScalingGroupProps } from '@guardian/cdk/lib/constructs/autoscaling';
import { GuAutoScalingGroup } from '@guardian/cdk/lib/constructs/autoscaling';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import {
	GuDistributionBucketParameter,
	GuLoggingStreamNameParameter,
	GuStack,
} from '@guardian/cdk/lib/constructs/core';
import {
	GuSecurityGroup,
	GuVpc,
	SubnetType,
} from '@guardian/cdk/lib/constructs/ec2';
import type { App } from 'aws-cdk-lib';
import { CfnParameter, Tags } from 'aws-cdk-lib';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	Port,
	UserData,
} from 'aws-cdk-lib/aws-ec2';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { CfnDBInstance, DatabaseInstanceProps } from 'aws-cdk-lib/aws-rds';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';
import { Bucket } from 'aws-cdk-lib/aws-s3';
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
			storageEncrypted: true,
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
		new StringParameter(this, 'PostgresInstanceEndpointAddress', {
			parameterName: `/${stage}/${stack}/${app}/postgres-instance-endpoint-address`,
			simpleName: false,
			stringValue: db.dbInstanceEndpointAddress,
			tier: ParameterTier.STANDARD,
			dataType: ParameterDataType.TEXT,
		});

		db.connections.allowFrom(
			applicationToPostgresSecurityGroup,
			Port.tcp(port),
		);

		const userData = UserData.forLinux();

		const deployToolsAccountID = new CfnParameter(
			this,
			'deployToolsAccountIDParam',
			{
				type: 'String',
				description: 'Account ID for deployTools',
			},
		);

		const devPlaygroundAccountID = new CfnParameter(
			this,
			'devPlaygroundAccountIDParam',
			{
				type: 'String',
				description: 'Account ID for developerPlayground',
			},
		);

		const bucket = Bucket.fromBucketName(
			this,
			'distributionBucket',
			GuDistributionBucketParameter.getInstance(this).valueAsString,
		);

		userData.addS3DownloadCommand({
			bucket: bucket,
			bucketKey: `${stack}/${stage}/${app}/aws.yaml`,
			localFile: '/aws.yaml',
		});

		userData.addS3DownloadCommand({
			bucket: bucket,
			bucketKey: `${stack}/${stage}/${app}/postgresql.yaml`,
			localFile: '/postgresql.yaml',
		});

		userData.addS3DownloadCommand({
			bucket: bucket,
			bucketKey: `${stack}/${stage}/${app}/cloudquery.service`,
			localFile: '/etc/systemd/system/cloudquery.service',
		});

		userData.addS3DownloadCommand({
			bucket: bucket,
			bucketKey: `${stack}/${stage}/${app}/cloudquery.timer`,
			localFile: '/etc/systemd/system/cloudquery.timer',
		});

		userData.addS3DownloadCommand({
			bucket: bucket,
			bucketKey: `${stack}/${stage}/${app}/cloudquery.sh`,
			localFile: '/cloudquery.sh',
		});

		userData.addCommands(
			'# Install Cloudquery',
			`set -xe`,
			`curl -L https://github.com/cloudquery/cloudquery/releases/download/cli-v2.5.1/cloudquery_linux_arm64 -o cloudquery`,
			`chmod a+x cloudquery`,

			// Set permission to execute cloudquery.sh
			`chmod a+x /cloudquery.sh`,

			`# Set target accounts - temp until we use OUs`,
			`sed -i "s/£DEPLOY_TOOLS_ACCOUNT_ID/${deployToolsAccountID.valueAsString}/g" aws.yaml`,
			`sed -i "s/£DEV_PLAYGROUND_ACCOUNT_ID/${devPlaygroundAccountID.valueAsString}/g" aws.yaml`,

			// Install RDS certificate
			'curl https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem -o /usr/local/share/ca-certificates/rds-ca-2019-root.crt',
			'update-ca-certificates',

			'systemctl enable cloudquery.timer',
			'systemctl start cloudquery.timer',
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

		/*
		Manually add tags required by devx-logs to build fluentbit configuration,
		as GuCDK does not currently support this.

		See https://github.com/guardian/cdk/issues/1800.
		 */
		Tags.of(asg).add(
			MetadataKeys.LOG_KINESIS_STREAM_NAME,
			GuLoggingStreamNameParameter.getInstance(this).valueAsString,
		);
		Tags.of(asg).add(MetadataKeys.SYSTEMD_UNIT, `${app}.service`);

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
					'sdb:Select*',
					'sqs:ReceiveMessage',
				],
			}),
		);

		asg.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.DENY,
				actions: ['s3:GetObject'],
				// This NotResource allows downloading from the artifact bucket, and denies everything else.
				// See https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_notresource.html
				notResources: [bucket.arnForObjects(`${stack}/${stage}/${app}/*`)],
			}),
		);

		asg.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: ['arn:aws:iam::*:role/cloudquery-access'],
				actions: ['sts:AssumeRole'],
			}),
		);

		const { attrDbiResourceId } = db.node.defaultChild as CfnDBInstance;

		asg.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: [
					`arn:aws:rds-db:${this.region}:${this.account}:dbuser:${attrDbiResourceId}/cloudquery`,
				],
				actions: ['rds-db:connect'],
			}),
		);
	}
}
