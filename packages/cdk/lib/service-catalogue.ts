import type {
	GuLambdaErrorPercentageMonitoringProps,
	NoMonitoring,
} from '@guardian/cdk/lib/constructs/cloudwatch';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import {
	GuAnghammaradTopicParameter,
	GuStack,
} from '@guardian/cdk/lib/constructs/core';
import { GuVpc, SubnetType } from '@guardian/cdk/lib/constructs/ec2';
import type { App } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { BranchProtector } from './branch-protector';
import { CloudQuery } from './cloudquery';
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

		const { stage } = this;

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

		const anghammaradTopicParameter =
			GuAnghammaradTopicParameter.getInstance(this);

		const anghammaradTopic = Topic.fromTopicArn(
			this,
			'anghammarad-arn',
			anghammaradTopicParameter.valueAsString,
		);

		const prodMonitoring: GuLambdaErrorPercentageMonitoringProps = {
			toleratedErrorPercentage: 50,
			lengthOfEvaluationPeriod: Duration.minutes(1),
			numberOfEvaluationPeriodsAboveThresholdBeforeAlarm: 1,
			snsTopicName: 'devx-alerts',
		};

		const codeMonitoring: NoMonitoring = { noMonitoring: true };

		const stageAwareMonitoringConfiguration =
			stage === 'PROD' ? prodMonitoring : codeMonitoring;

		const cloudquery = new CloudQuery(this, vpc);

		const interactiveMonitor = new InteractiveMonitor(this);

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
			cloudquery.db,
			stageAwareMonitoringConfiguration,
			vpc,
			branchProtector.queue,
			interactiveMonitor.topic,
			cloudquery.applicationToPostgresSecurityGroup,
		);
	}
}
