import type {
	GuLambdaErrorPercentageMonitoringProps,
	NoMonitoring,
} from '@guardian/cdk/lib/constructs/cloudwatch';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import {
	GuAnghammaradTopicParameter,
	GuStack,
	GuStringParameter,
} from '@guardian/cdk/lib/constructs/core';
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
import { Duration } from 'aws-cdk-lib';
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
import {
	CaCertificate,
	DatabaseInstance,
	DatabaseInstanceEngine,
} from 'aws-cdk-lib/aws-rds';
import { Secret as SecretsManager } from 'aws-cdk-lib/aws-secretsmanager';
import { Topic } from 'aws-cdk-lib/aws-sns';
import {
	ParameterDataType,
	ParameterTier,
	StringParameter,
} from 'aws-cdk-lib/aws-ssm';
import { BranchProtector } from './branch-protector';
import { addDataAuditLambda } from './data-audit';
import type { CloudquerySource } from './ecs/cluster';
import { CloudqueryCluster } from './ecs/cluster';
import {
	awsSourceConfigForAccount,
	awsSourceConfigForOrganisation,
	fastlySourceConfig,
	galaxiesSourceConfig,
	githubSourceConfig,
	guardianSnykSourceConfig,
	riffraffSourcesConfig,
	skipTables,
	snykSourceConfig,
} from './ecs/config';
import {
	cloudqueryAccess,
	listOrgsPolicy,
	readBucketPolicy,
} from './ecs/policies';
import { InteractiveMonitor } from './interactive-monitor';
import { Repocop } from './repocop';

interface ServiceCatalogueProps extends GuStackProps {
	//TODO add fields for every kind of job to make schedule explicit at a glance.
	//For code environments, data accuracy is not the main priority.
	// To keep costs low, we can choose to run all the tasks on the same cadence, less frequently than on prod
	schedule?: Schedule;

	/**
	 * Enable deletion protection for the RDS instance?
	 *
	 * @default true
	 */
	rdsDeletionProtection?: boolean;
}

export class ServiceCatalogue extends GuStack {
	constructor(scope: App, id: string, props: ServiceCatalogueProps) {
		super(scope, id, props);

		const { stage, stack } = this;
		const app = props.app ?? 'service-catalogue';

		const { rdsDeletionProtection = true } = props;

		const nonProdSchedule = props.schedule;

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
			deletionProtection: rdsDeletionProtection,

			/*
			This certificate supports automatic rotation.
			See https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html#UsingWithRDS.SSL.RegionCertificateAuthorities
			 */
			caCertificate: CaCertificate.RDS_CA_RDS2048_G1,
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

		// Used by downstream services that read ServiceCatalogue data, namely Grafana.
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

		const riffRaffDatabaseAccessSecurityGroupParam =
			StringParameter.valueForStringParameter(
				this,
				`/${stage}/deploy/riff-raff/external-database-access-security-group`,
			);

		// Provisioned by RiffRaff to specifically allow applications other than RiffRaff to access its DB
		// See https://github.com/guardian/deploy-tools-platform/pull/731
		const applicationToRiffRaffDatabaseSecurityGroup =
			GuSecurityGroup.fromSecurityGroupId(
				this,
				'RiffRaffDatabaseAccessSecurityGroup',
				riffRaffDatabaseAccessSecurityGroupParam,
			);

		const individualAwsSources: CloudquerySource[] = [
			{
				name: 'DeployToolsListOrgs',
				description:
					'Data about the AWS Organisation, including accounts and OUs. Uses include mapping account IDs to account names.',
				schedule:
					nonProdSchedule ??
					Schedule.cron({ month: '1', day: '1', hour: '10' }), // Run on the first of the month at 10am
				config: awsSourceConfigForAccount(GuardianAwsAccounts.DeployTools, {
					tables: [
						/*
						Collect all AWS Organisation tables, including account names, and which OU they belong to.
						A wildcard is used, as there are a lot of tables!
						See https://www.cloudquery.io/docs/advanced-topics/performance-tuning#use-wildcard-matching
						 */
						'aws_organization*',
					],
				}),
				policies: [
					listOrgsPolicy,
					cloudqueryAccess(GuardianAwsAccounts.DeployTools),
				],
			},
			{
				name: 'DelegatedToSecurityAccount',
				description:
					'Organisation wide security data, from access analyzer and security hub. Uses include identifying lambdas using deprecated runtimes.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '22' }),
				config: awsSourceConfigForAccount(GuardianAwsAccounts.Security, {
					tables: ['aws_accessanalyzer_*', 'aws_securityhub_*'],
					concurrency: 2000,
				}),
				policies: [cloudqueryAccess(GuardianAwsAccounts.Security)],
				memoryLimitMiB: 2048,
				cpu: 1024,
			},
			{
				name: 'OrgWideCloudFormation',
				description:
					'Collecting CloudFormation data across the organisation. We use CloudFormation stacks as a proxy for a service, so collect the data multiple times a day',
				schedule: nonProdSchedule ?? Schedule.rate(Duration.hours(3)),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_cloudformation_*'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideLoadBalancers',
				description:
					'Collecting load balancer data across the organisation. Uses include building SLO dashboards.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '23' }),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_elbv1_*', 'aws_elbv2_*'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideAutoScalingGroups',
				description:
					'Collecting ASG data across the organisation. Uses include building SLO dashboards.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '0' }),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_autoscaling_groups'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideCertificates',
				description:
					'Collecting certificate data across the organisation. Uses include building SLO dashboards.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '1' }),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_acm*'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideCloudwatchAlarms',
				description:
					'Collecting CloudWatch Alarm data across the organisation. Uses include building SLO dashboards.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '2' }),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_cloudwatch_alarms'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideInspector',
				description: 'Collecting Inspector data across the organisation.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '3' }),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_inspector_findings', 'aws_inspector2_findings'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideS3',
				description:
					'Collecting S3 data across the organisation. Uses include identifying which account a bucket resides.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '4' }),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_s3*'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideDynamoDB',
				description:
					'Collecting DynamoDB data across the organisation. Uses include auditing backup configuration.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '5' }),
				config: awsSourceConfigForOrganisation({
					tables: ['aws_dynamodb*'],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
			{
				name: 'OrgWideEc2',
				description:
					'Collecting EC2 instance information, and their security groups. Uses include identifying instances failing the "30 day old" SLO, and (eventually) replacing Prism.',
				schedule: nonProdSchedule ?? Schedule.rate(Duration.minutes(30)),
				config: awsSourceConfigForOrganisation({
					tables: [
						'aws_ec2_instances',
						'aws_ec2_security_groups',
						'aws_ec2_images',
					],
				}),
				policies: [listOrgsPolicy, cloudqueryAccess('*')],
			},
		];

		/*
		This is a catch-all task, collecting all other AWS data.
		Although we're not using the data for any particular reason, it is still useful to have.

		It runs once a week because there is a lot of data, and we need to avoid overlapping invocations.
		If we identify a table that needs to be updated more often, we should create a dedicated task for it.
		 */
		const remainingAwsSources: CloudquerySource = {
			name: 'RemainingAwsData',
			description: 'Data fetched across all accounts in the organisation.',
			schedule:
				nonProdSchedule ??
				Schedule.cron({ minute: '0', hour: '16', weekDay: 'SAT' }), // Every Saturday, at 4PM UTC
			config: awsSourceConfigForOrganisation({
				tables: ['aws_*'],
				skipTables: [
					...skipTables,

					// casting because `config.spec.tables` could be empty, though in reality it never is
					...(individualAwsSources.flatMap(
						(_) => _.config.spec.tables,
					) as string[]),
				],

				// Defaulted to 500000 by ServiceCatalogue, concurrency controls the maximum number of Go routines to use.
				// The amount of memory used is a function of this value.
				// See https://www.cloudquery.io/docs/reference/source-spec#concurrency.
				concurrency: 2000,
			}),
			policies: [cloudqueryAccess('*')],

			// This task is quite expensive, and requires more power than the default (500MB memory, 0.25 vCPU).
			memoryLimitMiB: 2048,
			cpu: 1024,
		};

		const cloudqueryGithubCredentials = new SecretsManager(
			this,
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
			'echo $GITHUB_PRIVATE_KEY | base64 -d > /github-private-key',
			'echo $GITHUB_APP_ID > /github-app-id',
			'echo $GITHUB_INSTALLATION_ID > /github-installation-id',
		];

		const githubSources: CloudquerySource[] = [
			{
				name: 'GitHubRepositories',
				description:
					'Collect GitHub repository data. Uses include RepoCop, which flags repositories that do not meet certain obligations.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '0' }),
				config: githubSourceConfig({
					tables: [
						'github_repositories',
						'github_repository_branches',
						'github_workflows',
					],

					// We're not (yet) interested in the following tables, so do not collect them to reduce API quota usage.
					// See https://www.cloudquery.io/docs/advanced-topics/performance-tuning#improve-performance-by-skipping-relations
					skipTables: [
						'github_releases',
						'github_release_assets',
						'github_repository_dependabot_alerts',
						'github_repository_dependabot_secrets',
					],
				}),
				secrets: githubSecrets,
				additionalCommands: additionalGithubCommands,
			},
			{
				name: 'GitHubTeams',
				description:
					'Collect GitHub team data. Uses include identifying which repositories a team owns.',
				schedule:
					nonProdSchedule ??
					Schedule.cron({ weekDay: '1', hour: '10', minute: '0' }),
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
						ServiceCatalogue collects child tables automatically.
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
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '2' }),
				config: githubSourceConfig({
					tables: ['github_issues'],
				}),
				secrets: githubSecrets,
				additionalCommands: additionalGithubCommands,
			},
		];

		const fastlyCredentials = new SecretsManager(this, 'fastly-credentials', {
			secretName: `/${stage}/${stack}/${app}/fastly-credentials`,
		});

		const fastlySources: CloudquerySource[] = [
			{
				name: 'FastlyServices',
				description: 'Fastly services data',
				schedule: nonProdSchedule ?? Schedule.rate(Duration.days(1)),
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
				schedule: nonProdSchedule ?? Schedule.rate(Duration.days(1)),
				policies: [
					readBucketPolicy(
						`${actionsStaticSiteBucket.bucketArn}/galaxies.gutools.co.uk/data/*`,
					),
				],
				config: galaxiesSourceConfig(actionsStaticSiteBucket.bucketName),
			},
		];

		const snykCredentials = new SecretsManager(this, 'snyk-credentials', {
			secretName: `/${stage}/${stack}/${app}/snyk-credentials`,
		});

		const snykSources: CloudquerySource[] = [
			{
				name: 'SnykAll',
				description: 'Collecting all Snyk data, except for projects',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '6' }),
				config: snykSourceConfig({
					tables: [
						'snyk_dependencies',
						'snyk_groups',
						'snyk_group_members',
						'snyk_integrations',
						'snyk_organizations',
						'snyk_organization_members',
						'snyk_reporting_issues',
						'snyk_reporting_latest_issues',
					],
					skipTables: ['snyk_organization_provisions'],
				}),
				secrets: {
					SNYK_API_KEY: Secret.fromSecretsManager(snykCredentials, 'api-key'),
				},
			},
			{
				name: 'GuardianCustomSnykProjects',
				description:
					'Collecting Snyk projects including grouped vulnerabilities and tags',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '5' }),
				config: guardianSnykSourceConfig({
					tables: ['snyk_projects'],
				}),
				secrets: {
					SNYK_API_KEY: Secret.fromSecretsManager(snykCredentials, 'api-key'),
				},
			},
		];

		const cloudqueryRiffRaffDatabaseCredentials = new SecretsManager(
			this,
			'RiffRaffDatabaseCredentials',
			{
				secretName: `/${stage}/${stack}/${app}/riffraff-database-credentials`,
			},
		);

		const riffRaffSources: CloudquerySource = {
			name: 'RiffRaffData',
			description: "Source deployment data directly from riff-raff's database",
			schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '0' }),
			config: riffraffSourcesConfig(),
			extraSecurityGroups: [applicationToRiffRaffDatabaseSecurityGroup],
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
				riffRaffSources,
			],
		});

		const anghammaradTopicParameter =
			GuAnghammaradTopicParameter.getInstance(this);

		const prodMonitoring: GuLambdaErrorPercentageMonitoringProps = {
			toleratedErrorPercentage: 50,
			lengthOfEvaluationPeriod: Duration.minutes(1),
			numberOfEvaluationPeriodsAboveThresholdBeforeAlarm: 1,
			snsTopicName: 'devx-alerts',
		};

		const codeMonitoring: NoMonitoring = { noMonitoring: true };

		const stageAwareMonitoringConfiguration =
			stage === 'PROD' ? prodMonitoring : codeMonitoring;

		const interactiveMonitor = new InteractiveMonitor(this);

		const anghammaradTopic = Topic.fromTopicArn(
			this,
			'anghammarad-arn',
			anghammaradTopicParameter.valueAsString,
		);

		const branchProtector = new BranchProtector(
			this,
			stageAwareMonitoringConfiguration,
			nonProdSchedule ??
				Schedule.cron({ minute: '0', hour: '9', weekDay: 'TUE-FRI' }),
			vpc,
			anghammaradTopic,
		);

		new Repocop(
			this,
			nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '15' }),
			anghammaradTopic,
			db,
			stageAwareMonitoringConfiguration,
			vpc,
			branchProtector.queue,
			interactiveMonitor.topic,
			applicationToPostgresSecurityGroup,
		);

		addDataAuditLambda(this);
	}
}
