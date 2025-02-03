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
import { GuardianPrivateNetworks } from '@guardian/private-infrastructure-config';
import type { App } from 'aws-cdk-lib';
import { Duration, Tags } from 'aws-cdk-lib';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	Peer,
	Port,
} from 'aws-cdk-lib/aws-ec2';
import type { Schedule } from 'aws-cdk-lib/aws-events';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { DatabaseInstanceProps } from 'aws-cdk-lib/aws-rds';
import {
	CaCertificate,
	DatabaseInstance,
	DatabaseInstanceEngine,
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
import { addDataAuditLambda } from './data-audit';
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
	 * Enable deletion protection for the RDS instance?
	 *
	 * @default true
	 */
	rdsDeletionProtection?: boolean;
	multiAz?: boolean;

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
}

export class ServiceCatalogue extends GuStack {
	constructor(scope: App, id: string, props: ServiceCatalogueProps) {
		super(scope, id, props);

		const { stage, stack } = this;
		const app = props.app ?? 'service-catalogue';

		const {
			rdsDeletionProtection = true,
			multiAz = false,
			gitHubOrg = 'guardian',
			securityAlertSchedule,
			enableCloudquerySchedules,
		} = props;

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
			multiAz: multiAz,
			/*
			This certificate supports automatic rotation.
			See https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html#UsingWithRDS.SSL.RegionCertificateAuthorities
			 */
			caCertificate: CaCertificate.RDS_CA_RDS2048_G1,
		};

		const db = new DatabaseInstance(this, 'PostgresInstance1', dbProps);

		Tags.of(db).add('devx-backup-enabled', 'true');

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

		const interactiveMonitor = new InteractiveMonitor(this, gitHubOrg);

		const anghammaradTopic = Topic.fromTopicArn(
			this,
			'anghammarad-arn',
			anghammaradTopicParameter.valueAsString,
		);

		const repocopGithubCredentials = new Secret(
			this,
			`repocop-github-app-auth`,
			{
				secretName: `/${stage}/${stack}/service-catalogue/repocop-github-app-secret`,
			},
		);

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
		);

		addDataAuditLambda(this, {
			vpc,
			db,
			dbAccess: applicationToPostgresSecurityGroup,
		});

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
		});
	}
}
