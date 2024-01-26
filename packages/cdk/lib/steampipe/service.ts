import {
	type AppIdentity,
	GuLoggingStreamNameParameter,
	type GuStack,
} from '@guardian/cdk/lib/constructs/core';
import { GuCname } from '@guardian/cdk/lib/constructs/dns';
import { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { Duration } from 'aws-cdk-lib';
import { Port } from 'aws-cdk-lib/aws-ec2';
import type { ISecurityGroup } from 'aws-cdk-lib/aws-ec2';
import {
	FargateService,
	FargateTaskDefinition,
	FireLensLogDriver,
	FirelensLogRouterType,
	LogDrivers,
	Secret,
} from 'aws-cdk-lib/aws-ecs';
import type { FargateServiceProps } from 'aws-cdk-lib/aws-ecs';
import {
	NetworkLoadBalancer,
	Protocol,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Secret as SecretsManager } from 'aws-cdk-lib/aws-secretsmanager';
import { Images } from '../cloudquery/images';

export const STEAMPIPE_DB_PORT = 9193;

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

		const task = new FargateTaskDefinition(scope, `${id}TaskDefinition`, {
			memoryLimitMiB: 512,
			cpu: 256,
		});

		const fireLensLogDriver = new FireLensLogDriver({
			options: {
				Name: `kinesis_streams`,
				region,
				stream: loggingStreamName,
				retry_limit: '2',
			},
		});

		task.addContainer(`${id}Container`, {
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
			command: ['service', 'start', '--foreground'],
			logging: fireLensLogDriver,
			portMappings: [
				{
					containerPort: STEAMPIPE_DB_PORT,
					name: 'steampipe',
				},
			],
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
		});

		nlbListener.addTargets(`steampipe-nlb-target`, {
			port: STEAMPIPE_DB_PORT,
			protocol: Protocol.TCP,
			targets: [this],
			healthCheck: {
				healthyThresholdCount: 2,
				interval: Duration.seconds(5),
				timeout: Duration.seconds(2),
			},
		});
	}
}
