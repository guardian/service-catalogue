import { type GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { GuardianPrivateNetworks } from '@guardian/private-infrastructure-config';
import { Duration } from 'aws-cdk-lib';
import {
	InstanceClass,
	InstanceSize,
	InstanceType,
	Peer,
	Port,
	type IVpc,
} from 'aws-cdk-lib/aws-ec2';
import { Schedule } from 'aws-cdk-lib/aws-events';
import type { DatabaseInstanceProps } from 'aws-cdk-lib/aws-rds';
import {
	CaCertificate,
	DatabaseInstance,
	DatabaseInstanceEngine,
} from 'aws-cdk-lib/aws-rds';
import {
	ParameterDataType,
	ParameterTier,
	StringParameter,
} from 'aws-cdk-lib/aws-ssm';
import { AwsSources } from './cloudquery-sources/aws-sources';
import { FastlySources } from './cloudquery-sources/fastly-sources';
import { GalaxiesSources } from './cloudquery-sources/galaxies-sources';
import { GithubSources } from './cloudquery-sources/github-sources';
import { RiffRaffSources } from './cloudquery-sources/riff-raff-sources';
import { SnykSources } from './cloudquery-sources/snyk-sources';
import { CloudqueryCluster } from './ecs/cluster';

export class CloudQuery {
	public readonly db: DatabaseInstance;
	public readonly applicationToPostgresSecurityGroup: GuSecurityGroup;
	constructor(guStack: GuStack, vpc: IVpc, nonProdSchedule?: Schedule) {
		nonProdSchedule ?? Schedule.rate(Duration.days(1));

		const app = guStack.app ?? 'service-catalogue';
		const port = 5432;
		const dbSecurityGroup = new GuSecurityGroup(
			guStack,
			'PostgresSecurityGroup',
			{
				app,
				vpc,
			},
		);

		const dbProps: DatabaseInstanceProps = {
			engine: DatabaseInstanceEngine.POSTGRES,
			port,
			vpc,
			vpcSubnets: { subnets: vpc.privateSubnets },
			iamAuthentication: true, // We're not using IAM auth for ECS tasks, however we do use IAM auth when connecting to RDS locally.
			instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
			storageEncrypted: true,
			securityGroups: [dbSecurityGroup],
			deletionProtection: true,

			/*
			This certificate supports automatic rotation.
			See https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html#UsingWithRDS.SSL.RegionCertificateAuthorities
			 */
			caCertificate: CaCertificate.RDS_CA_RDS2048_G1,
		};

		const db = new DatabaseInstance(guStack, 'PostgresInstance1', dbProps);
		const applicationToPostgresSecurityGroup = new GuSecurityGroup(
			guStack,
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
		new StringParameter(guStack, 'PostgresAccessSecurityGroupParam', {
			parameterName: `/${guStack.stage}/${guStack.stack}/${app}/postgres-access-security-group`,
			simpleName: false,
			stringValue: applicationToPostgresSecurityGroup.securityGroupId,
			tier: ParameterTier.STANDARD,
			dataType: ParameterDataType.TEXT,
		});
		new StringParameter(guStack, 'PostgresInstanceEndpointAddress', {
			parameterName: `/${guStack.stage}/${guStack.stack}/${app}/postgres-instance-endpoint-address`,
			simpleName: false,
			stringValue: db.dbInstanceEndpointAddress,
			tier: ParameterTier.STANDARD,
			dataType: ParameterDataType.TEXT,
		});

		const awsSources = new AwsSources(guStack, app, nonProdSchedule);

		const fastlySources = new FastlySources(
			guStack,
			nonProdSchedule ?? Schedule.rate(Duration.days(1)),
			app,
		);

		const galaxiesSources = new GalaxiesSources(
			guStack,
			nonProdSchedule ?? Schedule.rate(Duration.days(1)),
		);

		const riffRaffSources = new RiffRaffSources(
			guStack,
			nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '0' }),
			app,
		);

		const githubSources = new GithubSources(guStack, app, nonProdSchedule);

		new CloudqueryCluster(guStack, `${app}Cluster`, {
			app,
			vpc,
			db,
			dbAccess: applicationToPostgresSecurityGroup,
			sources: [
				...awsSources.individualSources,
				awsSources.remainingSource,
				...githubSources.sources,
				...fastlySources.sources,
				...galaxiesSources.sources,
				...new SnykSources(guStack, app, nonProdSchedule).sources,
				riffRaffSources.sources,
			],
		});

		this.db = db;
		this.applicationToPostgresSecurityGroup =
			applicationToPostgresSecurityGroup;
	}
}
