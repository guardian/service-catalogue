import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import {
	GuSecurityGroup,
	GuVpc,
	SubnetType,
} from '@guardian/cdk/lib/constructs/ec2';
import { GuardianAwsAccounts } from '@guardian/private-infrastructure-config';
import type { App } from 'aws-cdk-lib';
import { ArnFormat, Duration } from 'aws-cdk-lib';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	Port,
} from 'aws-cdk-lib/aws-ec2';
import { Secret } from 'aws-cdk-lib/aws-ecs';
import { Schedule } from 'aws-cdk-lib/aws-events';
import type { DatabaseInstanceProps } from 'aws-cdk-lib/aws-rds';
import { DatabaseInstance, DatabaseInstanceEngine } from 'aws-cdk-lib/aws-rds';
import { Secret as SecretsManager } from 'aws-cdk-lib/aws-secretsmanager';
import {
	ParameterDataType,
	ParameterTier,
	StringParameter,
} from 'aws-cdk-lib/aws-ssm';
import type { CloudquerySource } from './ecs/cluster';
import { CloudqueryCluster } from './ecs/cluster';
import {
	awsSourceConfigForAccount,
	awsSourceConfigForOrganisation,
	fastlySourceConfig,
	githubSourceConfig,
	skipTables,
} from './ecs/config';
import {
	cloudqueryAccess,
	listOrgsPolicy,
	readonlyAccessManagedPolicy,
	standardDenyPolicy,
} from './ecs/policies';

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

		const awsSources: CloudquerySource[] = [
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
				policies: [standardDenyPolicy, cloudqueryAccess('*')],
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
				policies: [
					listOrgsPolicy,
					standardDenyPolicy,
					cloudqueryAccess(GuardianAwsAccounts.DeployTools),
				],
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
				policies: [
					standardDenyPolicy,
					cloudqueryAccess(GuardianAwsAccounts.Security),
				],
			},
		];

		const githubCredentials = SecretsManager.fromSecretPartialArn(
			this,
			'github-credentials',
			this.formatArn({
				service: 'secretsmanager',
				resource: 'secret',
				resourceName: `/${stage}/${stack}/${app}/github-credentials`,
				arnFormat: ArnFormat.COLON_RESOURCE_NAME,
			}),
		);

		const githubSecrets: Record<string, Secret> = {
			GITHUB_PRIVATE_KEY: Secret.fromSecretsManager(
				githubCredentials,
				'private-key',
			),
			GITHUB_APP_ID: Secret.fromSecretsManager(githubCredentials, 'app-id'),
			GITHUB_INSTALLATION_ID: Secret.fromSecretsManager(
				githubCredentials,
				'installation-id',
			),
		};

		const additionalGithubCommands = [
			'echo $GITHUB_PRIVATE_KEY | base64 -d > /github-private-key',
			'echo $GITHUB_APP_ID > /github-app-id',
			'echo $GITHUB_INSTALLATION_ID > /github-installation-id',
		];

		const githubSources: CloudquerySource[] = [
			{
				name: 'GitHubRepositories',
				description: 'Collect GitHub repository data',
				schedule: Schedule.rate(Duration.days(1)),
				config: githubSourceConfig({ tables: ['github_repositories'] }),
				secrets: githubSecrets,
				additionalCommands: additionalGithubCommands,
			},
		];

		const fastlyCredentials = SecretsManager.fromSecretPartialArn(
			this,
			'fastly-credentials',
			this.formatArn({
				service: 'secretsmanager',
				resource: 'secret',
				resourceName: `/${stage}/${stack}/${app}/fastly-credentials`,
				arnFormat: ArnFormat.COLON_RESOURCE_NAME,
			}),
		);

		const fastlySources: CloudquerySource[] = [
			{
				name: 'FastlyServices',
				description: 'Fastly services data',
				schedule: Schedule.rate(Duration.days(1)),
				config: fastlySourceConfig({
					tables: [
						'fastly_services',
						'fastly_service_versions',
						'fastly_service_backends',
						'fastly_service_domains',
						'fastly_service_health_checks',
					],
				}),
				secrets: {
					FASTLY_API_KEY: Secret.fromSecretsManager(
						fastlyCredentials,
						'api-key',
					),
				},
			},
		];

		new CloudqueryCluster(this, `${app}Cluster`, {
			app,
			vpc,
			db,
			dbAccess: applicationToPostgresSecurityGroup,
			sources: [...awsSources, ...githubSources, ...fastlySources],
		});
	}
}
