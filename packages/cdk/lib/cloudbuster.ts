import { GuScheduledLambda } from '@guardian/cdk';
import type {
	GuLambdaErrorPercentageMonitoringProps,
	NoMonitoring,
} from '@guardian/cdk/lib/constructs/cloudwatch';
import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { Duration } from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import type { Schedule } from 'aws-cdk-lib/aws-events';
import { Architecture, LoggingFormat, Runtime } from 'aws-cdk-lib/aws-lambda';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import type { ITopic } from 'aws-cdk-lib/aws-sns';

type CloudBusterProps = {
	vpc: IVpc;
	dbAccess: GuSecurityGroup;
	db: DatabaseInstance;
	anghammaradTopic: ITopic;
	monitoringConfiguration:
	| NoMonitoring
	| GuLambdaErrorPercentageMonitoringProps;
	schedule: Schedule;
	digestCutOffInDays: number;
};

export class CloudBuster {
	constructor(stack: GuStack, props: CloudBusterProps) {
		const {
			vpc,
			dbAccess,
			db,
			anghammaradTopic,
			monitoringConfiguration,
			schedule,
			digestCutOffInDays,
		} = props;
		const app = 'cloudbuster';

		const lambda = new GuScheduledLambda(stack, 'cloudbuster', {
			app,
			vpc,
			architecture: Architecture.ARM_64,
			runtime: Runtime.NODEJS_20_X,
			securityGroups: [dbAccess],
			fileName: `${app}.zip`,
			handler: 'index.main',
			environment: {
				ANGHAMMARAD_SNS_ARN: anghammaradTopic.topicArn,
				DATABASE_HOSTNAME: db.dbInstanceEndpointAddress,
				QUERY_LOGGING: 'false',
				CUT_OFF_IN_DAYS: digestCutOffInDays.toString(),

			},
			timeout: Duration.minutes(2),
			memorySize: 512,
			monitoringConfiguration,
			loggingFormat: LoggingFormat.TEXT,
			rules: [{ schedule }],
		});
		anghammaradTopic.grantPublish(lambda);

		db.grantConnect(lambda, 'cloudbuster');
	}
}
