import { GuardianPrivateNetworks } from '@guardian/aws-account-setup';
import type {
	GuLambdaErrorPercentageMonitoringProps,
	NoMonitoring,
} from '@guardian/cdk/lib/constructs/cloudwatch';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import {
	GuAnghammaradTopicParameter,
	GuLoggingStreamNameParameter,
	GuStack,
} from '@guardian/cdk/lib/constructs/core';
import {
	GuSecurityGroup,
	GuVpc,
	SubnetType,
} from '@guardian/cdk/lib/constructs/ec2';
import type { App } from 'aws-cdk-lib';
import { Duration, Tags } from 'aws-cdk-lib';
import {
	CfnAlarm,
	CfnAnomalyDetector,
	ComparisonOperator,
	TreatMissingData,
} from 'aws-cdk-lib/aws-cloudwatch';
import type { InstanceType } from 'aws-cdk-lib/aws-ec2';
import { Peer, Port } from 'aws-cdk-lib/aws-ec2';
import type { Schedule } from 'aws-cdk-lib/aws-events';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { DatabaseInstanceProps } from 'aws-cdk-lib/aws-rds';
import {
	CaCertificate,
	DatabaseInstance,
	DatabaseInstanceEngine,
	StorageType,
} from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Topic } from 'aws-cdk-lib/aws-sns';
import {
	ParameterDataType,
	ParameterTier,
	StringParameter,
} from 'aws-cdk-lib/aws-ssm';
import { getCentralElkLink } from 'common/src/logs';
import { CloudBuster } from './cloudbuster';
import { addCloudqueryEcsCluster } from './cloudquery';
import { addCloudqueryUsageLambda } from './cloudquery-usage';
import { addGithubActionsUsageLambda } from './github-actions-usage';
import { InteractiveMonitor } from './interactive-monitor';
import { Obligatron } from './obligatron';
import { addPrismaMigrateTask } from './prisma-migrate-task';
import { addRefreshMaterializedViewLambda } from './refresh-materialized-view';
import { Repocop } from './repocop';

function createProdMonitoringConfiguration(
	app: string,
): GuLambdaErrorPercentageMonitoringProps {
	return {
		toleratedErrorPercentage: 50,
		lengthOfEvaluationPeriod: Duration.minutes(1),
		numberOfEvaluationPeriodsAboveThresholdBeforeAlarm: 1,
		snsTopicName: 'devx-alerts',
		alarmDescription: `${app} error percentage is too high. Find the logs here ${getCentralElkLink(
			{
				filters: {
					stage: 'PROD',
					app,
				},
			},
		)}`,
	};
}

function createLambdaMonitoringConfiguration(
	stage: string,
	app: string,
): NoMonitoring | GuLambdaErrorPercentageMonitoringProps {
	if (stage === 'PROD') {
		return createProdMonitoringConfiguration(app);
	} else {
		return { noMonitoring: true };
	}
}
interface ServiceCatalogueProps extends GuStackProps {
	/**
	 * When to run the RepoCop and CloudBuster apps.
	 */
	securityAlertSchedule: Schedule;

	/**
	 * The GitHub org to search for repositories in.
	 */
	gitHubOrg?: string;

	/**
	 * Each CloudQuery data collection task has a schedule.
	 * When true, the schedule will be enabled, and data collection will occur as defined.
	 * When false, the schedule will be disabled. Tasks will need to be run manually using the CLI.
	 */
	enableCloudquerySchedules: boolean;

	/**
	 * Enable deletion protection for the RDS instance?
	 */
	databaseDeletionProtection: boolean;

	/**
	 * The instance type to be used by RDS (e.g. t4g.small)
	 */
	databaseInstanceType: InstanceType;

	/**
	 * Should the database be provisioned in multiple availability zones for increased resilience?
	 */
	databaseMultiAz: boolean;

	/**
	 * Should the EBS byte balance metric of the database be monitored?
	 */
	databaseEbsByteBalanceAlarm: boolean;
}

export class ServiceCatalogue extends GuStack {
	constructor(scope: App, id: string, props: ServiceCatalogueProps) {
		super(scope, id, props);

		const { account, stage, stack } = this;
		const app = props.app ?? 'service-catalogue';

		const {
			gitHubOrg = 'guardian',
			securityAlertSchedule,
			enableCloudquerySchedules,
			databaseDeletionProtection,
			databaseMultiAz,
			databaseInstanceType,
			databaseEbsByteBalanceAlarm,
		} = props;

		const alertTopicName = 'devx-sec-ops-reliability-alerts';

		const alertTopic = Topic.fromTopicArn(
			this,
			'AlertTopic',
			`arn:aws:sns:eu-west-1:${account}:${alertTopicName}`,
		);

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
			instanceType: databaseInstanceType,
			vpcSubnets: { subnets: privateSubnets },
			iamAuthentication: true, // We're not using IAM auth for ECS tasks, however we do use IAM auth when connecting to RDS locally.
			storageEncrypted: true,
			securityGroups: [dbSecurityGroup],
			deletionProtection: databaseDeletionProtection,
			multiAz: databaseMultiAz,
			/*
			This certificate supports automatic rotation.
			See https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html#UsingWithRDS.SSL.RegionCertificateAuthorities
			 */
			caCertificate: CaCertificate.RDS_CA_RSA2048_G1,
			storageType: StorageType.GP3,
			enablePerformanceInsights: true,
			monitoringInterval: Duration.seconds(10),
		};

		const db = new DatabaseInstance(this, 'PostgresInstance1', dbProps);

		Tags.of(db).add('devx-backup-enabled', 'true');

		if (databaseEbsByteBalanceAlarm) {
			const metric = db.metric('EBSByteBalance%');
			const metricStat = metric.toMetricConfig().metricStat;

			if (!metricStat) {
				throw new Error("MetricStat is undefined. This shouldn't happen.");
			}

			new CfnAnomalyDetector(this, `${metric.metricName}AnomalyDetector`, {
				metricName: metric.metricName,
				namespace: metric.namespace,
				stat: metricStat.statistic,
				dimensions: metricStat.dimensions,
			});

			new CfnAlarm(this, `${metric.metricName}Alarm`, {
				comparisonOperator:
					ComparisonOperator.LESS_THAN_LOWER_OR_GREATER_THAN_UPPER_THRESHOLD,
				treatMissingData: TreatMissingData.BREACHING,
				datapointsToAlarm: 1,
				evaluationPeriods: 1,
				actionsEnabled: true,
				alarmActions: [alertTopic.topicArn],
				okActions: [alertTopic.topicArn],
				thresholdMetricId: 'ad1',
				metrics: [
					{
						id: 'ad1',
						returnData: true,
						expression: 'ANOMALY_DETECTION_BAND(m1, 2)',
					},
					{
						id: 'm1',
						returnData: true,
						metricStat: {
							metric: {
								namespace: metric.namespace,
								metricName: metric.metricName,
								dimensions: metricStat.dimensions,
							},
							period: Duration.minutes(5).toSeconds(),
							stat: metricStat.statistic,
						},
					},
				],
			});
		}

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

		const loggingStreamName =
			GuLoggingStreamNameParameter.getInstance(this).valueAsString;

		const loggingStreamArn = this.formatArn({
			service: 'kinesis',
			resource: 'stream',
			resourceName: loggingStreamName,
		});

		const logShippingPolicy = new PolicyStatement({
			actions: ['kinesis:Describe*', 'kinesis:Put*'],
			effect: Effect.ALLOW,
			resources: [loggingStreamArn],
		});

		const cloudqueryApiKey = new Secret(this, 'cloudquery-api-key', {
			secretName: `/${stage}/${stack}/${app}/cloudquery-api-key`,
		});

		const cloudqueryCluster = addCloudqueryEcsCluster(this, {
			enableCloudquerySchedules,
			db,
			vpc,
			dbAccess: applicationToPostgresSecurityGroup,
			loggingStreamName,
			logShippingPolicy,
			gitHubOrg,
			cloudqueryApiKey,
		});

		addCloudqueryUsageLambda(this, {
			vpc,
			db,
			dbAccess: applicationToPostgresSecurityGroup,
			cloudqueryApiKey,
		});

		const anghammaradTopicParameter =
			GuAnghammaradTopicParameter.getInstance(this);

		const anghammaradTopic = Topic.fromTopicArn(
			this,
			'anghammarad-arn',
			anghammaradTopicParameter.valueAsString,
		);

		const interactiveMonitor = new InteractiveMonitor(
			this,
			gitHubOrg,
			anghammaradTopic,
		);

		const repocopGithubCredentials = new Secret(
			this,
			`repocop-github-app-auth`,
			{
				secretName: `/${stage}/${stack}/service-catalogue/repocop-github-app-secret`,
			},
		);

		const digestCutOffInDays = 45;

		new Repocop(
			this,
			securityAlertSchedule,
			anghammaradTopic,
			db,
			createLambdaMonitoringConfiguration(stage, 'repocop'),
			vpc,
			interactiveMonitor.topic,
			applicationToPostgresSecurityGroup,
			repocopGithubCredentials,
			gitHubOrg,
			digestCutOffInDays,
		);

		addGithubActionsUsageLambda(this, {
			vpc,
			db,
			dbAccess: applicationToPostgresSecurityGroup,
		});

		addPrismaMigrateTask(this, {
			loggingStreamName,
			logShippingPolicy,
			db,
			dbAccess: applicationToPostgresSecurityGroup,
			cluster: cloudqueryCluster,
		});

		addRefreshMaterializedViewLambda(this, {
			vpc,
			db,
			dbAccess: applicationToPostgresSecurityGroup,
		});

		new Obligatron(this, {
			vpc,
			db,
			dbAccess: applicationToPostgresSecurityGroup,
		});

		new CloudBuster(this, {
			vpc,
			db,
			dbAccess: applicationToPostgresSecurityGroup,
			anghammaradTopic,
			monitoringConfiguration: createLambdaMonitoringConfiguration(
				stage,
				'cloudbuster',
			),
			schedule: securityAlertSchedule,
			digestCutOffInDays,
		});
	}
}
