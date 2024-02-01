import {
	type AppIdentity,
	GuLoggingStreamNameParameter,
	type GuStack,
} from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { Duration } from 'aws-cdk-lib';
import type { ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Port } from 'aws-cdk-lib/aws-ec2';
import type { FargateServiceProps } from 'aws-cdk-lib/aws-ecs';
import {
	CpuArchitecture,
	FargateService,
	FargateTaskDefinition,
	FireLensLogDriver,
	FirelensLogRouterType,
	LogDrivers,
	Secret,
} from 'aws-cdk-lib/aws-ecs';
import { PerformanceMode, ThroughputMode } from 'aws-cdk-lib/aws-efs';
import {
	NetworkLoadBalancer,
	Protocol,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Secret as SecretsManager } from 'aws-cdk-lib/aws-secretsmanager';
import { Images } from '../cloudquery/images';
import { GuFileSystem } from './filesystem';

export const STEAMPIPE_DB_PORT = 9193;
export const EFS_PORT = 2049;

export interface SteampipeServiceProps
	extends AppIdentity,
		Omit<FargateServiceProps, 'Cluster' | 'taskDefinition'> {
	/**
	 * Any secrets to pass to the CloudQuery container.
	 *
	 * @see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs.ContainerDefinitionOptions.html#secrets
	 * @see https://repost.aws/knowledge-center/ecs-data-security-container-task
	 */
	secrets?: Record<string, Secret>;

	/**
	 * IAM policies to attach to the task.
	 */
	policies: PolicyStatement[];

	/**
	 * Security group allowing access to Network Load Balancer
	 */
	accessSecurityGroup: ISecurityGroup;

	/**
	 * Domain to access Steampipe DB from
	 */
	domainName: 'steampipe.code.dev-gutools.co.uk' | 'steampipe.gutools.co.uk';
}

export class SteampipeService extends FargateService {
	constructor(scope: GuStack, id: string, props: SteampipeServiceProps) {
		const { policies, cluster, app, accessSecurityGroup, domainName } = props;
		const { region, stack, stage } = scope;
		const thisRepo = 'guardian/service-catalogue'; // TODO get this from GuStack

		const loggingStreamName =
			GuLoggingStreamNameParameter.getInstance(scope).valueAsString;
		const loggingStreamArn = scope.formatArn({
			service: 'kinesis',
			resource: 'stream',
			resourceName: loggingStreamName,
		});

		const logShippingPolicy = new PolicyStatement({
			actions: ['kinesis:Describe*', 'kinesis:Put*'],
			effect: Effect.ALLOW,
			resources: [loggingStreamArn],
		});

		const taskPolicies = [logShippingPolicy, ...policies];

		const steampipeCredentials = new SecretsManager(
			scope,
			'steampipe-credentials',
			{
				secretName: `/${stage}/${stack}/${app}/steampipe-credentials`,
			},
		);

		const steampipeSecurityGroup = new GuSecurityGroup(scope, `steampipe-sg`, {
			app: app,
			vpc: cluster.vpc,
		});

		// Anything with this SG can talk to anything else with this SG
		// In this case the NLB can talk to the ECS Service
		steampipeSecurityGroup.addIngressRule(
			steampipeSecurityGroup,
			Port.tcp(STEAMPIPE_DB_PORT),
			'Allow this SG to talk to other applications also using this SG (in this case NLB to ECS)',
		);

		steampipeSecurityGroup.addIngressRule(
			steampipeSecurityGroup,
			Port.tcp(EFS_PORT),
			'Allow this SG to talk to EFS mounts also using this SG',
		);

		const fileSystem = new GuFileSystem(scope, 'SteampipeDatabaseEFS', {
			vpc: cluster.vpc,
			encrypted: true,
			throughputMode: ThroughputMode.ELASTIC,
			performanceMode: PerformanceMode.GENERAL_PURPOSE,
			vpcSubnets: {
				subnets: cluster.vpc.privateSubnets,
			},
			securityGroup: steampipeSecurityGroup,
		});

		// By default the root folder of an EFS FileSystem is owned by a root user
		// In order to get a folder that can be written to by the Steampipe user we need to create
		// an AccessPoint which allows us to set the POSIX permissions on the mount point.
		const accessPoint = fileSystem.addAccessPoint(
			'SteampipeDatabaseEFSAccessPoint',
			{
				createAcl: {
					// From https://github.com/turbot/steampipe/blob/main/Dockerfile#L8
					ownerGid: '0',
					ownerUid: '9193',
					// Owner can Read, Write, and Execute, everyone else just read and execute
					permissions: '755',
				},
				path: '/steampipe-database',
			},
		);

		const task = new FargateTaskDefinition(scope, `${id}TaskDefinition`, {
			memoryLimitMiB: 2048,
			cpu: 1024,
			runtimePlatform: {
				cpuArchitecture: CpuArchitecture.ARM64,
			},
			volumes: [
				{
					name: 'steampipe-database',
					efsVolumeConfiguration: {
						fileSystemId: fileSystem.fileSystemId,
						transitEncryption: 'ENABLED',
						authorizationConfig: {
							accessPointId: accessPoint.accessPointId,
						},
					},
				},
			],
		});

		const fireLensLogDriver = new FireLensLogDriver({
			options: {
				Name: `kinesis_streams`,
				region,
				stream: loggingStreamName,
				retry_limit: '2',
			},
		});

		const steampipe = task.addContainer(`${id}Containers`, {
			image: Images.steampipe,
			dockerLabels: {
				Stack: stack,
				Stage: stage,
				App: app,
			},
			secrets: {
				STEAMPIPE_DATABASE_PASSWORD: Secret.fromSecretsManager(
					steampipeCredentials,
					'steampipe-db-password',
				),
				// Steampipe Github plugin currently only supports PAT tokens
				GITHUB_TOKEN: Secret.fromSecretsManager(
					steampipeCredentials,
					'github-token',
				),
			},
			command: [
				'generate-aws-plugin-config; steampipe service start --foreground',
			],
			logging: fireLensLogDriver,
			portMappings: [
				{
					containerPort: STEAMPIPE_DB_PORT,
					name: 'steampipe',
				},
			],
			entryPoint: ['/bin/sh', '-c'],
		});

		steampipe.addMountPoints({
			containerPath: '/home/steampipe/.steampipe/db/14.2.0/',
			sourceVolume: 'steampipe-database',
			readOnly: false,
		});

		task.addFirelensLogRouter(`${id}Firelens`, {
			image: Images.devxLogs,
			logging: LogDrivers.awsLogs({
				streamPrefix: [stack, stage, app].join('/'),
				logRetention: RetentionDays.ONE_DAY,
			}),
			environment: {
				STACK: stack,
				STAGE: stage,
				APP: app,
				GU_REPO: thisRepo,
			},
			firelensConfig: {
				type: FirelensLogRouterType.FLUENTBIT,
			},
		});

		taskPolicies.forEach((policy) => task.addToTaskRolePolicy(policy));

		const nlb = new NetworkLoadBalancer(scope, `steampipe-nlb`, {
			vpc: cluster.vpc,
			securityGroups: [accessSecurityGroup, steampipeSecurityGroup],
		});

		const nlbListener = nlb.addListener(`steampipe-nlb-listener`, {
			port: STEAMPIPE_DB_PORT,
			protocol: Protocol.TCP,
		});

		new GuCname(scope, 'SteampipeDNS', {
			app: app,
			ttl: Duration.hours(1),
			domainName,
			resourceRecord: nlb.loadBalancerDnsName,
		});

		super(scope, id, {
			cluster,
			vpcSubnets: { subnets: cluster.vpc.privateSubnets },
			taskDefinition: task,
			securityGroups: [steampipeSecurityGroup],
			assignPublicIp: false,
			desiredCount: 1,
			minHealthyPercent: 0,
			maxHealthyPercent: 100,
		});

		const target = nlbListener.addTargets(`steampipe-nlb-target`, {
			port: STEAMPIPE_DB_PORT,
			protocol: Protocol.TCP,
			targets: [this],
			healthCheck: {
				healthyThresholdCount: 2,
				interval: Duration.seconds(5),
				timeout: Duration.seconds(2),
			},
			// Apps like Grafana will keep a connection to Steampipe alive as long as possible.
			// When an ECS task is deactivated the NLB tries to be helpful and will keep the task alive
			// for up to 5 minutes whilst theres still active connections.
			//
			// Because we only allow a max of 1 instance of Steampipe this is not particularly useful to us
			// and we'd prefer for the old instance to stop as quickly as possible so that the new instance
			// can start. Setting the deregistrationDelay to 0 will cause the NLB to terminate connections
			// and launch the new instance with 0 delay.
			deregistrationDelay: Duration.seconds(0),
		});

		target.setAttribute(
			'deregistration_delay.connection_termination.enabled',
			'true',
		);
	}
}
