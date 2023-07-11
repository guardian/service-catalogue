import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack, GuStringParameter } from '@guardian/cdk/lib/constructs/core';
import {
	GuSecurityGroup,
	GuVpc,
	SubnetType,
} from '@guardian/cdk/lib/constructs/ec2';
import { GuS3Bucket } from '@guardian/cdk/lib/constructs/s3';
import {
	GuardianAwsAccounts,
	GuardianPrivateNetworks,
} from '@guardian/private-infrastructure-config';
import type { App } from 'aws-cdk-lib';
import { ArnFormat, Duration } from 'aws-cdk-lib';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	Peer,
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
	galaxiesSourceConfig,
	githubSourceConfig,
	guardianSnykSourceConfig,
	skipTables,
	snykSourceConfig,
} from './ecs/config';
import {
	cloudqueryAccess,
	listOrgsPolicy,
	readBucketPolicy,
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

		const dbSecurityGroup = new GuSecurityGroup(this, 'PostgresSecurityGroup', {
			app,
			vpc,
		});

		const dbProps: DatabaseInstanceProps = {
			engine: DatabaseInstanceEngine.POSTGRES,
			port,
			vpc,
			vpcSubnets: { subnets: privateSubnets },
			iamAuthentication: true, // We're not using IAM auth for ECS tasks, however we do use IAM auth when connecting to RDS locally.
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			storageEncrypted: true,
			securityGroups: [dbSecurityGroup],
		};

		const db = new DatabaseInstance(this, 'PostgresInstance1', dbProps);

		const applicationToPostgresSecurityGroup = new GuSecurityGroup(
			this,
			'PostgresAccessSecurityGroup',
			{ app, vpc },
		);

		// TODO use a bastion host here instead? https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ec2.BastionHostLinux.html
		dbSecurityGroup.addIngressRule(
			Peer.ipv4(GuardianPrivateNetworks.Engineering),
			Port.tcp(port),
			'Allow connection to Postgres from the office network.',
		);

		dbSecurityGroup.connections.allowFrom(
			applicationToPostgresSecurityGroup,
			Port.tcp(port),
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

		const readonlyPolicy = readonlyAccessManagedPolicy(
			this,
			'readonly-managed-policy',
		);

		const individualAwsSources: CloudquerySource[] = [
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
				managedPolicies: [readonlyPolicy],
				policies: [
					listOrgsPolicy,
					standardDenyPolicy,
					cloudqueryAccess(GuardianAwsAccounts.DeployTools),
				],
			},
			{
				name: 'DelegatedToSecurityAccount',
				description:
					'Collecting data across the organisation from services delegated to the Security account.',
				schedule: Schedule.rate(Duration.days(1)),
				config: awsSourceConfigForAccount(GuardianAwsAccounts.Security, {
					tables: ['aws_accessanalyzer_*', 'aws_securityhub_*'],
					concurrency: 2000,
				}),
				managedPolicies: [readonlyPolicy],
				policies: [
					standardDenyPolicy,
					cloudqueryAccess(GuardianAwsAccounts.Security),
				],
				memoryLimitMiB: 2048,
				cpu: 1024,
			},
			{
				name: 'OrgWideCloudFormation',
				description:
					'Collecting CloudFormation data across the organisation. We use CloudFormation stacks as a proxy for a service, so collect the data multiple times a day',
				schedule: Schedule.rate(Duration.hours(3)),
				config: awsSourceConfigForOrganisation({
					tables: [
						'aws_cloudformation_stacks',
						'aws_cloudformation_stack_resources',
						'aws_cloudformation_stack_templates',
						'aws_cloudformation_template_summaries',
					],
				}),
				managedPolicies: [readonlyPolicy],
				policies: [listOrgsPolicy, standardDenyPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideLoadBalancers',
				description: 'Collecting load balancer data across the organisation.',
				schedule: Schedule.rate(Duration.days(1)),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_elbv1_*', 'aws_elbv2_*'],
				}),
				managedPolicies: [readonlyPolicy],
				policies: [listOrgsPolicy, standardDenyPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideCertificates',
				description: 'Collecting certificate data across the organisation.',
				schedule: Schedule.rate(Duration.days(1)),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_acm*'],
				}),
				managedPolicies: [readonlyPolicy],
				policies: [listOrgsPolicy, standardDenyPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideCloudwatchAlarms',
				description:
					'Collecting CloudWatch Alarm data across the organisation.',
				schedule: Schedule.rate(Duration.days(1)),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_cloudwatch_alarms'],
				}),
				managedPolicies: [readonlyPolicy],
				policies: [listOrgsPolicy, standardDenyPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideInspector',
				description: 'Collecting Inspector data across the organisation.',
				schedule: Schedule.rate(Duration.days(1)),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_inspector_findings', 'aws_inspector2_findings'],
				}),
				managedPolicies: [readonlyPolicy],
				policies: [listOrgsPolicy, standardDenyPolicy, cloudqueryAccess('*')],
			},
		];

		const remainingAwsSources: CloudquerySource = {
			name: 'All',
			description: 'Data fetched across all accounts in the organisation.',
			schedule: Schedule.rate(Duration.days(1)),
			config: awsSourceConfigForOrganisation({
				tables: ['aws_*'],
				skipTables: [
					...skipTables,

					// casting because `config.spec.tables` could be empty, though in reality it never is
					...(individualAwsSources.flatMap(
						(_) => _.config.spec.tables,
					) as string[]),
				],

				// Defaulted to 500000 by CloudQuery, concurrency controls the maximum number of Go routines to use.
				// The amount of memory used is a function of this value.
				// See https://www.cloudquery.io/docs/reference/source-spec#concurrency.
				concurrency: 2000,
			}),
			managedPolicies: [readonlyPolicy],
			policies: [standardDenyPolicy, cloudqueryAccess('*')],

			// This task is quite expensive, and requires more power than the default (500MB memory, 0.25 vCPU).
			memoryLimitMiB: 2048,
			cpu: 1024,
		};

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
				config: githubSourceConfig({
					tables: ['github_repositories'],

					// We're not (yet) interested in the following tables, so do not collect them to reduce API quota usage.
					// See https://www.cloudquery.io/docs/advanced-topics/performance-tuning#improve-performance-by-skipping-relations
					skipTables: [
						'github_releases',
						'github_release_assets',
						'github_repository_branches',
						'github_repository_dependabot_alerts',
						'github_repository_dependabot_secrets',
					],
				}),
				secrets: githubSecrets,
				additionalCommands: additionalGithubCommands,
			},
			{
				name: 'GitHubTeams',
				description: 'Collect GitHub team data',
				schedule: Schedule.cron({ weekDay: '1', hour: '10', minute: '0' }),
				config: githubSourceConfig({
					tables: [
						'github_organizations',
						'github_organization_members',
						'github_teams',
						'github_team_members',
						'github_team_repositories',
					],
					skipTables: [
						/*
						These tables are children of github_organizations.
						CloudQuery collects child tables automatically.
						We don't use them as they take a long time to collect, so skip them.
						See https://www.cloudquery.io/docs/advanced-topics/performance-tuning#improve-performance-by-skipping-relations
						 */
						'github_organization_dependabot_alerts',
						'github_organization_dependabot_secrets',
					],
				}),
				secrets: githubSecrets,
				additionalCommands: additionalGithubCommands,
			},
			{
				name: 'GitHubIssues',
				description: 'Collect GitHub issue data (PRs and Issues)',
				schedule: Schedule.rate(Duration.days(1)),
				config: githubSourceConfig({
					tables: ['github_issues'],
				}),
				secrets: githubSecrets,
				additionalCommands: additionalGithubCommands,
			},
			{
				name: 'GitHubBranches',
				description:
					'Collect GitHub branch data, specifically the latest commit',
				schedule: Schedule.rate(Duration.days(1)),
				config: githubSourceConfig({
					tables: ['github_repository_branches'],
				}),
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

		// The bucket in which the Galaxies data lives.
		const actionsStaticSiteBucketArn = new GuStringParameter(
			this,
			'ActionsStaticSiteBucketArnParam',
			{
				fromSSM: true,
				default: '/INFRA/deploy/cloudquery/actions-static-site-bucket-arn',
			},
		).valueAsString;

		const actionsStaticSiteBucket = GuS3Bucket.fromBucketArn(
			this,
			'ActionsStaticSiteBucket',
			actionsStaticSiteBucketArn,
		);

		const galaxiesSources: CloudquerySource[] = [
			{
				name: 'Galaxies',
				description: 'Galaxies data',
				schedule: Schedule.rate(Duration.days(1)),
				policies: [
					readBucketPolicy(
						`${actionsStaticSiteBucket.bucketArn}/galaxies.gutools.co.uk/data/*`,
					),
				],
				config: galaxiesSourceConfig(actionsStaticSiteBucket.bucketName),
			},
		];

		const snykCredentials = SecretsManager.fromSecretPartialArn(
			this,
			'snyk-credentials',
			this.formatArn({
				service: 'secretsmanager',
				resource: 'secret',
				resourceName: `/${stage}/${stack}/${app}/snyk-credentials`,
				arnFormat: ArnFormat.COLON_RESOURCE_NAME,
			}),
		);

		const snykSources: CloudquerySource[] = [
			{
				name: 'SnykAll',
				description: 'Collecting all Snyk data, except for projects',
				schedule: Schedule.rate(Duration.days(1)),
				config: snykSourceConfig({
					tables: [
						'snyk_dependencies',
						'snyk_groups',
						'snyk_group_members',
						'snyk_integrations',
						'snyk_organizations',
						'snyk_organization_members',
						'snyk_organization_provisions',
						'snyk_reporting_issues',
						'snyk_reporting_latest_issues',
					],
				}),
				secrets: {
					SNYK_API_KEY: Secret.fromSecretsManager(snykCredentials, 'api-key'),
				},
			},
			{
				name: 'GuardianCustomSnykProjects',
				description:
					'Collecting Snyk projects including grouped vulnerabilities and tags',
				schedule: Schedule.rate(Duration.days(1)),
				config: guardianSnykSourceConfig({
					tables: ['snyk_projects'],
				}),
				secrets: {
					SNYK_API_KEY: Secret.fromSecretsManager(snykCredentials, 'api-key'),
				},
			},
		];

		new CloudqueryCluster(this, `${app}Cluster`, {
			app,
			vpc,
			db,
			dbAccess: applicationToPostgresSecurityGroup,
			sources: [
				...individualAwsSources,
				remainingAwsSources,
				...githubSources,
				...fastlySources,
				...galaxiesSources,
				...snykSources,
			],
		});
	}
}
