import { GuScheduledLambda } from '@guardian/cdk';
import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import type { Secret as SecretsManager } from 'aws-cdk-lib/aws-secretsmanager';

interface CloudqueryUsageProps {
	vpc: IVpc;
	db: DatabaseInstance;
	dbAccess: GuSecurityGroup;
	cloudqueryApiKey: SecretsManager;
}

export function addCloudqueryUsageLambda(
	scope: GuStack,
	props: CloudqueryUsageProps,
) {
	const app = 'cloudquery-usage';

	const { vpc, dbAccess, db, cloudqueryApiKey } = props;

	const lambda = new GuScheduledLambda(scope, 'CloudqueryUsage', {
		app,
		vpc,
		fileName: `${app}.zip`,
		handler: 'index.main',
		monitoringConfiguration: { noMonitoring: true },
		architecture: Architecture.ARM_64,
		runtime: Runtime.NODEJS_20_X,
		securityGroups: [dbAccess],
		environment: {
			DATABASE_HOSTNAME: db.dbInstanceEndpointAddress,
			QUERY_LOGGING: 'false', // Set this to 'true' to enable SQL query logging
			CQ_API_KEY_PATH: cloudqueryApiKey.secretName,
		},
		rules: [
			{
				schedule: Schedule.cron({ hour: '9', minute: '0' }),
			},
		],
	});

	cloudqueryApiKey.grantRead(lambda);
	db.grantConnect(lambda, 'cloudquery_usage');
}
