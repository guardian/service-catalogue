import { GuardianAwsAccounts } from '@guardian/aws-account-setup';
import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuStringParameter } from '@guardian/cdk/lib/constructs/core';
import { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { GuS3Bucket } from '@guardian/cdk/lib/constructs/s3';
import { Duration } from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Secret } from 'aws-cdk-lib/aws-ecs';
import { Schedule } from 'aws-cdk-lib/aws-events';
import type { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { Secret as SecretsManager } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { filterCloudQueryTables } from 'cloudquery-tables';
import { awsTables } from 'cloudquery-tables/aws';
import { fastlyTables } from 'cloudquery-tables/fastly';
import { githubLanguagesTables } from 'cloudquery-tables/github';
import type { CloudquerySource } from './cluster';
import { CloudqueryCluster } from './cluster';
import {
	amigoBakePackagesConfig,
	awsSourceConfigForAccount,
	awsSourceConfigForOrganisation,
	CloudqueryWriteMode,
	endOfLifeSourceConfig,
	fastlySourceConfig,
	galaxiesSourceConfig,
	githubLanguagesConfig,
	githubSourceConfig,
	githubSourceConfigForRepository,
	ns1SourceConfig,
	riffraffSourcesConfig,
	serviceCatalogueConfigDirectory,
} from './config';
import { Images } from './images';
import {
	cloudqueryAccess,
	listOrgsPolicy,
	readBucketPolicy,
	readDynamoDbTablePolicy,
} from './policies';
import {
	inspector2TableOptions,
	securityHubTableOptions,
} from './table-options';

interface CloudqueryEcsClusterProps {
	vpc: IVpc;
	db: DatabaseInstance;
	dbAccess: GuSecurityGroup;
	loggingStreamName: string;
	logShippingPolicy: PolicyStatement;
	gitHubOrg: string;
	cloudqueryApiKey: SecretsManager;

	/**
	 * Each CloudQuery data collection task has a schedule.
	 * When true, the schedule will be enabled, and data collection will occur as defined.
	 * When false, the schedule will be disabled. Tasks will need to be run manually using the CLI.
	 */
	enableCloudquerySchedules: boolean;
}

export function addCloudqueryEcsCluster(
	scope: GuStack,
	props: CloudqueryEcsClusterProps,
) {
	const { stage, stack, app = 'service-catalogue', region } = scope;
	const {
		vpc,
		db,
		dbAccess,
		loggingStreamName,
		logShippingPolicy,
		gitHubOrg: gitHubOrgName,
		cloudqueryApiKey,
		enableCloudquerySchedules,
	} = props;

	const riffRaffDatabaseAccessSecurityGroupParam =
		StringParameter.valueForStringParameter(
			scope,
			`/${stage}/deploy/riff-raff/external-database-access-security-group`,
		);

	// Provisioned by RiffRaff to specifically allow applications other than RiffRaff to access its DB
	// See https://github.com/guardian/deploy-tools-platform/pull/731
	const applicationToRiffRaffDatabaseSecurityGroup =
		GuSecurityGroup.fromSecurityGroupId(
			scope,
			'RiffRaffDatabaseAccessSecurityGroup',
			riffRaffDatabaseAccessSecurityGroupParam,
		);

	const individualAwsSources: CloudquerySource[] = [
		{
			name: 'AwsListOrgs',
			description:
				'Data about the AWS Organisation, including accounts and OUs. Uses include mapping account IDs to account names.',
			schedule: Schedule.rate(Duration.days(1)),
			config: awsSourceConfigForAccount(GuardianAwsAccounts.DeployTools, {
				tables:
					/*
      Collect all AWS Organisation tables, including account names, and which OU they belong to.
      A wildcard is used, as there are a lot of tables!
      See https://www.cloudquery.io/docs/advanced-topics/performance-tuning#use-wildcard-matching
       */
					filterCloudQueryTables([/^aws_organization.*$/]),
			}),
			policies: [
				listOrgsPolicy,
				cloudqueryAccess(GuardianAwsAccounts.DeployTools),
			],
		},
		{
			name: 'AwsDelegatedToSecurityAccount',
			description:
				'Organisation wide security data, from access analyzer and security hub. Uses include identifying lambdas using deprecated runtimes.',
			schedule: Schedule.cron({ minute: '0', hour: '22' }),
			config: awsSourceConfigForAccount(
				GuardianAwsAccounts.Security,
				{
					tables: filterCloudQueryTables([
						/^aws_accessanalyzer_.*$/,
						/^aws_securityhub_.*$/,
						/^aws_guardduty_.*$/,
						/^aws_inspector2_findings$/,
					]),
					concurrency: 2000,
				},
				{
					table_options: {
						aws_securityhub_findings: securityHubTableOptions,
						aws_inspector2_findings: inspector2TableOptions,
					},
				},
			),
			policies: [cloudqueryAccess(GuardianAwsAccounts.Security)],
			memoryLimitMiB: 2048,
			cpu: 1024,
		},
		{
			name: 'AwsOrgWideCloudFormation',
			description:
				'Collecting CloudFormation data across the organisation. We use CloudFormation stacks as a proxy for a service, so collect the data multiple times a day',
			schedule: Schedule.rate(Duration.hours(3)),
			config: awsSourceConfigForOrganisation({
				tables: filterCloudQueryTables([/^aws_cloudformation_.*$/]),
			}),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
			memoryLimitMiB: 1024,
		},
		{
			name: 'AwsCostExplorer',
			description:
				'Collects daily AWS costs (aggregated by App, Stack and Stage tags). We aim to keep historical data for this table (unlike other tables)',
			schedule: Schedule.cron({ minute: '0', hour: '0' }),

			// TODO replace with time variable substitution once it supports relative date only strings.
			//  See https://cli-docs.cloudquery.io/docs/advanced-topics/environment-variable-substitution#time-variable-substitution-example
			//  See https://github.com/cloudquery/cloudquery/pull/20399
			additionalCommands: [
				/*
				START_DATE and END_DATE are only set if they're not already set.
				This allows us to backfill data if we need to via the CLI of this project, which sets the environment variables via container overrides.
				See https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_ContainerOverride.html.
				 */
				`export START_DATE=$\{START_DATE:-$(date -d "@$(($(date +%s) - ${Duration.days(2).toSeconds()}))" "+%Y-%m-%d")}`,
				`export END_DATE=$\{END_DATE:-$(date -d "@$(($(date +%s) - ${Duration.days(1).toSeconds()}))" "+%Y-%m-%d")}`,
			],
			writeMode: CloudqueryWriteMode.Overwrite,
			config: awsSourceConfigForOrganisation(
				{
					tables: ['aws_costexplorer_cost_custom'],
				},
				{
					use_paid_apis: true,
					table_options: {
						aws_costexplorer_cost_custom: {
							get_cost_and_usage: [
								{
									TimePeriod: {
										Start: '${START_DATE}',
										End: '${END_DATE}',
									},
									Granularity: 'DAILY',
									GroupBy: [
										{ Type: 'TAG', Key: 'App' },
										{ Type: 'TAG', Key: 'Stack' },
									],
									Metrics: [
										'NetUnblendedCost',
										'UnblendedCost',
										'NetAmortizedCost',
										'AmortizedCost',
									],
								},
							],
						},
					},
				},
			),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
		},
		{
			name: 'AwsOrgWideLoadBalancers',
			description:
				'Collecting load balancer data across the organisation. Uses include building SLO dashboards.',
			schedule: Schedule.rate(Duration.minutes(30)),
			// Use this to test filtering:
			config: awsSourceConfigForOrganisation({
				tables: filterCloudQueryTables([/^aws_elbv1_.*$/, /^aws_elbv2_.*$/]),
			}),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
		},
		{
			name: 'AwsOrgWideAutoScalingGroups',
			description:
				'Collecting ASG data across the organisation. Uses include building SLO dashboards.',
			schedule: Schedule.cron({ minute: '0', hour: '0' }),
			config: awsSourceConfigForOrganisation({
				tables: ['aws_autoscaling_groups'],
			}),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
		},
		{
			name: 'AwsOrgWideCertificates',
			description:
				'Collecting certificate data across the organisation. Uses include building SLO dashboards.',
			schedule: Schedule.cron({ minute: '0', hour: '1' }),
			config: awsSourceConfigForOrganisation({
				tables: filterCloudQueryTables([/^aws_acm_.*$/]),
			}),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
		},
		{
			name: 'AwsLambda',
			description: 'Collecting lambda data across the organisation.',
			schedule: Schedule.cron({ minute: '10', hour: '1' }),
			config: awsSourceConfigForOrganisation({
				tables: filterCloudQueryTables([/^aws_lambda_.*$/]),
			}),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
		},
		{
			name: 'AwsSSMParameters',
			description: 'Collecting ssm parameters across the organisation.',
			schedule: Schedule.cron({ minute: '20', hour: '1' }),
			config: awsSourceConfigForOrganisation({
				tables: ['aws_ssm_parameters'],
			}),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
		},
		{
			name: 'AwsOrgWideCloudwatchAlarms',
			description:
				'Collecting CloudWatch Alarm data across the organisation. Uses include building SLO dashboards.',
			schedule: Schedule.rate(Duration.minutes(30)),
			config: awsSourceConfigForOrganisation({
				tables: ['aws_cloudwatch_alarms'],
			}),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
		},
		{
			name: 'AwsOrgWideSns',
			description:
				'Collecting SNS data across the organisation. Uses include monitoring alarm configuration.',
			schedule: Schedule.cron({ minute: '0', hour: '3' }),
			config: awsSourceConfigForOrganisation({
				tables: ['aws_sns_topics'],
			}),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
		},
		{
			name: 'AwsOrgWideS3',
			description:
				'Collecting S3 data across the organisation. Uses include identifying which account a bucket resides.',
			schedule: Schedule.cron({ minute: '0', hour: '4' }),
			config: awsSourceConfigForOrganisation({
				tables: filterCloudQueryTables([/^aws_s3.*$/]),
			}),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
		},
		{
			name: 'AwsOrgWideDynamoDB',
			description:
				'Collecting DynamoDB data across the organisation. Uses include auditing backup configuration.',
			schedule: Schedule.cron({ minute: '0', hour: '5' }),
			config: awsSourceConfigForOrganisation({
				tables: filterCloudQueryTables([/^aws_dynamodb.*$/]),
			}),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
		},
		{
			name: 'AwsOrgWideRDS',
			description:
				'Collecting RDS data across the organisation. Uses include auditing backup configuration.',
			schedule: Schedule.cron({ minute: '0', hour: '6' }),
			config: awsSourceConfigForOrganisation({
				tables: [
					'aws_rds_instances',
					'aws_rds_clusters',
					'aws_rds_db_snapshots',
					'aws_rds_cluster_snapshots',
				],
			}),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
		},
		{
			name: 'AwsOrgWideBackup',
			description:
				'Collecting Backup data across the organisation. Uses include auditing backup configuration.',
			schedule: Schedule.cron({ minute: '0', hour: '7' }),
			config: awsSourceConfigForOrganisation({
				tables: [
					'aws_backup_protected_resources',
					'aws_backup_vaults',
					'aws_backup_vault_recovery_points',
				],
			}),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
			memoryLimitMiB: 1024,
		},
		{
			name: 'AwsOrgWideEc2',
			description:
				'Collecting EC2 instance information, and their security groups. Uses include identifying instances failing the "30 day old" SLO, and (eventually) replacing Prism.',
			schedule: Schedule.rate(Duration.minutes(30)),
			config: awsSourceConfigForOrganisation({
				tables: ['aws_ec2_instances', 'aws_ec2_security_groups'],
			}),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
			runAsSingleton: true,
			memoryLimitMiB: 1024,
		},
		{
			name: 'AwsOrgWideEc2Images',
			description:
				'Collecting EC2 image information. Uses include getting information for base images used in AMIgo.',
			schedule: Schedule.cron({ minute: '0', hour: '0' }),
			config: awsSourceConfigForOrganisation({
				tables: ['aws_ec2_images'],
			}),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
			runAsSingleton: true,
			memoryLimitMiB: 1024,
		},
		{
			name: 'AwsOrgWideIamCredentialReports',
			description:
				'Collecting IAM credential reports to surface information about outdated or inactive users and access keys',
			schedule: Schedule.rate(Duration.hours(4)),
			config: awsSourceConfigForOrganisation({
				tables: ['aws_iam_credential_reports'],
			}),
			policies: [listOrgsPolicy, cloudqueryAccess('*')],
			memoryLimitMiB: 1024,
		},
	];

	const collectedAwsTables = individualAwsSources.flatMap(
		(_) => _.config.spec.tables,
	);

	const remainingAwsTables = awsTables.filter(
		(_) => !collectedAwsTables.includes(_),
	);

	/*
	This is a catch-all task, collecting all other AWS data.
	Although we're not using the data for any particular reason, it is still useful to have.
	It runs once a week because there is a lot of data, and we need to avoid overlapping invocations.
	If we identify a table that needs to be updated more often, we should create a dedicated task for it.
	 */
	const remainingAwsSources: CloudquerySource = {
		name: 'AwsRemainingData',
		description: 'Data fetched across all accounts in the organisation.',
		schedule: Schedule.cron({ minute: '0', hour: '16', weekDay: 'SAT' }), // Every Saturday, at 4PM UTC
		config: awsSourceConfigForOrganisation({
			tables: remainingAwsTables,

			// Defaulted to 500000 by ServiceCatalogue, concurrency controls the maximum number of Go routines to use.
			// The amount of memory used is a function of this value.
			// See https://www.cloudquery.io/docs/reference/source-spec#concurrency.
			concurrency: 2000,
		}),
		policies: [listOrgsPolicy, cloudqueryAccess('*')],

		// This task is quite expensive, and requires more power than the default (500MB memory, 0.25 vCPU).
		memoryLimitMiB: 3072,
		cpu: 1024,
	};

	const cloudqueryGithubCredentials = new SecretsManager(
		scope,
		'github-credentials',
		{
			secretName: `/${stage}/${stack}/${app}/github-credentials`,
		},
	);

	const githubSecrets: Record<string, Secret> = {
		GITHUB_PRIVATE_KEY: Secret.fromSecretsManager(
			cloudqueryGithubCredentials,
			'private-key',
		),
		GITHUB_APP_ID: Secret.fromSecretsManager(
			cloudqueryGithubCredentials,
			'app-id',
		),
		GITHUB_INSTALLATION_ID: Secret.fromSecretsManager(
			cloudqueryGithubCredentials,
			'installation-id',
		),
	};

	const additionalGithubCommands = [
		`echo -n $GITHUB_PRIVATE_KEY | base64 -d > ${serviceCatalogueConfigDirectory}/github-private-key`,
		`echo -n $GITHUB_APP_ID >  ${serviceCatalogueConfigDirectory}/github-app-id`,
		`echo -n $GITHUB_INSTALLATION_ID >  ${serviceCatalogueConfigDirectory}/github-installation-id`,
	];

	const githubSources: CloudquerySource[] = [
		{
			name: 'GitHubRepositories',
			description:
				'Collect GitHub repository data. Uses include RepoCop, which flags repositories that do not meet certain obligations.',
			schedule: Schedule.cron({ minute: '0', hour: '0' }),
			config: githubSourceConfig({
				org: gitHubOrgName,
				tables: [
					'github_repositories',
					'github_repository_branches',
					'github_repository_collaborators',
					'github_repository_custom_properties',
					'github_repository_sboms',
					'github_workflows',
				],
			}),
			secrets: githubSecrets,
			additionalCommands: additionalGithubCommands,
			memoryLimitMiB: 2048,
		},
		{
			name: 'GitHubReleases',
			description: '',
			schedule: Schedule.cron({ weekDay: 'MON', hour: '10', minute: '0' }), // Every Monday, at 10AM UTC
			config: githubSourceConfigForRepository({
				org: gitHubOrgName,
				repositories: ['guardian/cdk'],
				tables: ['github_releases'],
			}),
			writeMode: CloudqueryWriteMode.Overwrite,
			secrets: githubSecrets,
			additionalCommands: additionalGithubCommands,
		},
		{
			name: 'GitHubTeams',
			description:
				'Collect GitHub team data. Uses include identifying which repositories a team owns.',
			schedule: Schedule.cron({ weekDay: '1', hour: '10', minute: '0' }),
			config: githubSourceConfig({
				org: gitHubOrgName,
				tables: [
					'github_organizations',
					'github_organization_members',
					'github_teams',
					'github_team_members',
					'github_team_repositories',
					'github_saml_identities',
				],
			}),
			secrets: githubSecrets,
			additionalCommands: additionalGithubCommands,
			memoryLimitMiB: 4096,
			cpu: 2048,
		},
		{
			name: 'GitHubIssues',
			description: 'Collect GitHub issue data (PRs and Issues)',
			schedule: Schedule.cron({ minute: '0', hour: '2' }),
			config: githubSourceConfig({
				org: gitHubOrgName,
				tables: ['github_issues'],
			}),
			secrets: githubSecrets,
			additionalCommands: additionalGithubCommands,
			memoryLimitMiB: 2048,
		},
		{
			name: 'GitHubSecretScanningAlerts',
			description: 'Collect GitHub secret scanning alerts',
			schedule: Schedule.cron({ hour: '23', minute: '0' }),
			config: githubSourceConfig({
				org: gitHubOrgName,
				tables: ['github_secret_scanning_alerts'],
			}),
			secrets: githubSecrets,
			additionalCommands: additionalGithubCommands,
			memoryLimitMiB: 2048,
		},
	];

	const fastlyCredentials = new SecretsManager(scope, 'fastly-credentials', {
		secretName: `/${stage}/${stack}/${app}/fastly-credentials`,
	});

	const fastlySources: CloudquerySource[] = [
		{
			name: 'FastlyServices',
			description: 'Fastly services data',
			schedule: Schedule.rate(Duration.days(1)),
			config: fastlySourceConfig({
				tables: fastlyTables,
			}),
			secrets: {
				FASTLY_API_KEY: Secret.fromSecretsManager(fastlyCredentials, 'api-key'),
			},
		},
	];

	// The bucket in which the Galaxies data lives.
	const actionsStaticSiteBucketArn = new GuStringParameter(
		scope,
		'ActionsStaticSiteBucketArnParam',
		{
			fromSSM: true,
			default: '/INFRA/deploy/cloudquery/actions-static-site-bucket-arn',
		},
	).valueAsString;

	const actionsStaticSiteBucket = GuS3Bucket.fromBucketArn(
		scope,
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

	const cloudqueryRiffRaffDatabaseCredentials = new SecretsManager(
		scope,
		'RiffRaffDatabaseCredentials',
		{
			secretName: `/${stage}/${stack}/${app}/riffraff-database-credentials`,
		},
	);

	const riffRaffSources: CloudquerySource = {
		name: 'RiffRaffData',
		description: "Source deployment data directly from riff-raff's database",
		schedule: Schedule.cron({ minute: '0', hour: '0' }),
		config: riffraffSourcesConfig(),
		additionalSecurityGroups: [applicationToRiffRaffDatabaseSecurityGroup],
		secrets: {
			RIFFRAFF_DB_USERNAME: Secret.fromSecretsManager(
				cloudqueryRiffRaffDatabaseCredentials,
				'username',
			),
			RIFFRAFF_DB_PASSWORD: Secret.fromSecretsManager(
				cloudqueryRiffRaffDatabaseCredentials,
				'password',
			),

			RIFFRAFF_DB_HOST: Secret.fromSecretsManager(
				cloudqueryRiffRaffDatabaseCredentials,
				'host',
			),
		},
	};

	const githubLanguagesSource: CloudquerySource = {
		name: 'GitHubLanguages',
		description: 'Collect GitHub languages data',
		schedule: Schedule.rate(Duration.days(7)),
		config: githubLanguagesConfig({
			tables: githubLanguagesTables,
			org: gitHubOrgName,
		}),
		secrets: githubSecrets,
		additionalCommands: additionalGithubCommands,
	};

	const ns1ApiKey = new SecretsManager(scope, 'ns1-credentials', {
		secretName: `/${stage}/${stack}/${app}/ns1-credentials`,
	});

	const ns1Source: CloudquerySource = {
		name: 'NS1',
		description: 'DNS records from NS1',
		schedule: Schedule.cron({ minute: '0', hour: '0' }),
		dockerDistributedPluginImage: Images.ns1Source,
		secrets: {
			NS1_API_KEY: Secret.fromSecretsManager(ns1ApiKey, 'api-key'),
		},
		config: ns1SourceConfig(),
	};

	const packagesBucketName = new GuStringParameter(
		scope,
		'packagesBucketNameParam',
		{
			fromSSM: true,
			default: `/${stage}/deploy/amigo/amigo.data.bucket`,
		},
	).valueAsString;

	const packagesBucket = GuS3Bucket.fromBucketName(
		scope,
		'packagesBucket',
		packagesBucketName,
	);

	const baseImagesTableName = `amigo-${stage}-base-images`;
	const recipesTableName = `amigo-${stage}-recipes`;
	const bakesTableName = `amigo-${stage}-bakes`;

	const amigoBakePackagesSource: CloudquerySource = {
		name: 'AmigoBakePackages',
		description: 'Packages installed in Amigo bakes.',
		schedule: Schedule.cron({ minute: '0', hour: '3' }),
		config: amigoBakePackagesConfig(
			baseImagesTableName,
			recipesTableName,
			bakesTableName,
			packagesBucket.bucketName,
		),
		memoryLimitMiB: 1024,
		policies: [
			readDynamoDbTablePolicy(
				GuardianAwsAccounts.DeployTools,
				region, // This assumes the tables are in the same region as Service Catalogue.
				baseImagesTableName,
				recipesTableName,
				bakesTableName,
			),
			readBucketPolicy(`${packagesBucket.bucketArn}/packagelists/*`),
		],
	};

	const endOfLifeSource: CloudquerySource = {
		name: 'EndOfLife',
		description: 'Collecting data from endoflife.date',
		schedule: Schedule.cron({ day: '1', hour: '0', minute: '0' }),
		config: endOfLifeSourceConfig(),
	};

	return new CloudqueryCluster(scope, `${app}Cluster`, {
		enableCloudquerySchedules,
		app,
		vpc,
		db,
		dbAccess,
		loggingStreamName,
		logShippingPolicy,
		sources: [
			...individualAwsSources,
			remainingAwsSources,
			...githubSources,
			...fastlySources,
			...galaxiesSources,
			riffRaffSources,
			githubLanguagesSource,
			ns1Source,
			amigoBakePackagesSource,
			endOfLifeSource,
		],
		cloudqueryApiKey,
	});
}
