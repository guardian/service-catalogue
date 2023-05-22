import * as path from 'path';
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
import {
	GuardianAwsAccounts,
	GuardianOrganisationalUnits,
} from '@guardian/private-infrastructure-config';
import type { App } from 'aws-cdk-lib';
import { Duration, Tags } from 'aws-cdk-lib';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	Port,
	UserData,
} from 'aws-cdk-lib/aws-ec2';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Effect, ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { DatabaseInstanceProps } from 'aws-cdk-lib/aws-rds';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import {
	ParameterDataType,
	ParameterTier,
	StringParameter,
} from 'aws-cdk-lib/aws-ssm';
import { CloudqueryCluster } from './ecs/cluster';
import {
	awsSourceConfigForAccount,
	awsSourceConfigForOrganisation,
	skipTables,
} from './ecs/config';
import {
	listOrgsPolicy,
	readonlyAccessManagedPolicy,
	standardDenyPolicy,
} from './ecs/policies';

const CloudQueryManifest = {
	/**
	 * The version of the CloudQuery CLI to install.
	 *
	 * @see https://github.com/cloudquery/cloudquery/releases?q=cli
	 */
	version: '2.5.3',

	/**
	 * The checksum of the CloudQuery CLI. Found in the `checksums.txt` asset.
	 *
	 * @see https://github.com/cloudquery/cloudquery/releases?q=cli
	 */
	checksum: '286cff19c54098328c0b85dbbfa94e87234b5a53be421c3b6ca406803122a7ee',
};

export class CloudQuery extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const { stage, stack } = this;
		const app = props.app ?? 'cloudquery';

		const privateSubnets = GuVpc.subnetsFromParameter(this, {
			type: SubnetType.PRIVATE,
		});

		const vpc = GuVpc.fromIdParameter(this, 'vpc', {
			/*
			CDK wants privateSubnetIds to be a multiple of availabilityZones.
			We're pulling the subnets from a parameter at runtime.
			We know they evaluate to 3 subnets, but at compile time CDK doesn't.
			Set the number of AZs to 1 to avoid the error:
			  `Error: Number of privateSubnetIds (1) must be a multiple of availability zones (2).`
			 */
			availabilityZones: ['ignored'],
			privateSubnetIds: privateSubnets.map((subnet) => subnet.subnetId),
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

		const bucket = Bucket.fromBucketName(
			this,
			'distributionBucket',
			GuDistributionBucketParameter.getInstance(this).valueAsString,
		);

		const baseDirectory = '/opt/cloudquery';
		const cloudqueryBinary = path.join(baseDirectory, 'cloudquery');

		const awsYamlFile = userData.addS3DownloadCommand({
			bucket: bucket,
			bucketKey: `${stack}/${stage}/${app}/aws.yaml`,
			localFile: path.join(baseDirectory, 'aws.yaml'),
		});

		const templateSummaryYamlFile = userData.addS3DownloadCommand({
			bucket: bucket,
			bucketKey: `${stack}/${stage}/${app}/template-summary.yaml`,
			localFile: path.join(baseDirectory, 'template-summary.yaml'),
		});

		userData.addS3DownloadCommand({
			bucket: bucket,
			bucketKey: `${stack}/${stage}/${app}/postgresql.yaml`,
			localFile: path.join(baseDirectory, 'postgresql.yaml'),
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

		const cloudqueryScript = userData.addS3DownloadCommand({
			bucket: bucket,
			bucketKey: `${stack}/${stage}/${app}/cloudquery.sh`,
			localFile: path.join(baseDirectory, 'cloudquery.sh'),
		});

		userData.addCommands(
			// Install Cloudquery,
			`set -xe`,
			`curl -L https://github.com/cloudquery/cloudquery/releases/download/cli-v${CloudQueryManifest.version}/cloudquery_linux_arm64 -o ${cloudqueryBinary}`,

			// Perform checksum verification
			`echo "${CloudQueryManifest.checksum}  ${cloudqueryBinary}" | shasum -c -a 256`,

			`chmod a+x ${cloudqueryBinary}`,

			// Set permission to execute cloudquery.sh
			`chmod a+x ${cloudqueryScript}`,

			// Set target Org Unit
			`sed -i "s/£TARGET_ORG_UNIT/${GuardianOrganisationalUnits.Root}/g" ${awsYamlFile}`,
			`sed -i "s/£TARGET_ORG_UNIT/${GuardianOrganisationalUnits.Root}/g" ${templateSummaryYamlFile}`,

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
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MEDIUM),
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

		db.grantConnect(asg, 'cloudquery');

		asg.addToRolePolicy(
			new PolicyStatement({
				effect: Effect.ALLOW,
				resources: ['*'],
				actions: ['organizations:List*'],
			}),
		);

		new CloudqueryCluster(this, `${app}Cluster`, {
			app,
			vpc,
			db,
			dbAccess: applicationToPostgresSecurityGroup,
			sources: [
				{
					name: 'All',
					description: 'Data fetched across all accounts in the organisation.',
					schedule: Schedule.rate(Duration.days(1)),
					config: awsSourceConfigForOrganisation({
						tables: ['*'],
						skipTables: skipTables,
					}),
					managedPolicies: [
						readonlyAccessManagedPolicy(this, 'fetch-all-managed-policy'),
					],
					policies: [standardDenyPolicy],
				},
				{
					name: 'DeployToolsListOrgs',
					description:
						'Data fetched from the Deploy Tools account (delegated from Root).',
					schedule: Schedule.rate(Duration.days(1)),
					config: awsSourceConfigForAccount(GuardianAwsAccounts.DeployTools, {
						tables: [
							'aws_organizations',
							'aws_organizations_accounts',
							'aws_organizations_delegated_services',
							'aws_organizations_delegated_administrators',
							'aws_organizations_organizational_units',
							'aws_organizations_policies',
							'aws_organizations_roots',
						],
					}),
					managedPolicies: [
						readonlyAccessManagedPolicy(this, 'list-orgs-managed-policy'),
					],
					policies: [listOrgsPolicy, standardDenyPolicy],
				},
				{
					name: 'SecurityAccessAnalyser',
					description:
						'Data fetched from the Security account. Note, Access Analyzer collects data from our entire organisation so we only need to query it in one place.',
					schedule: Schedule.rate(Duration.days(1)),
					config: awsSourceConfigForAccount(GuardianAwsAccounts.Security, {
						tables: [
							'aws_accessanalyzer_analyzers',
							'aws_accessanalyzer_analyzer_archive_rules',
							'aws_accessanalyzer_analyzer_findings',
						],
					}),
					managedPolicies: [
						readonlyAccessManagedPolicy(this, 'access-analyser-managed-policy'),
					],
					policies: [standardDenyPolicy],
				},
			],
		});
	}
}
