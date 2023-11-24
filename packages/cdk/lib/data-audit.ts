import { GuScheduledLambda } from '@guardian/cdk';
import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import type { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { Duration } from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import type { DatabaseInstance } from 'aws-cdk-lib/aws-rds';
import { cloudqueryAccess, listOrgsPolicy } from './cloudquery/ecs/policies';

interface DataAuditProps {
	vpc: IVpc;
	db: DatabaseInstance;
	dbAccess: GuSecurityGroup;
}

export function addDataAuditLambda(scope: GuStack, props: DataAuditProps) {
	const app = 'data-audit';

	const { vpc, dbAccess, db } = props;

	const lambda = new GuScheduledLambda(scope, 'DataAudit', {
		app,
		vpc,
		securityGroups: [dbAccess],
		fileName: `${app}.zip`,
		handler: 'index.main',
		environment: {
			DATABASE_HOSTNAME: db.dbInstanceEndpointAddress,
			QUERY_LOGGING: 'false', // Set this to 'true' to enable SQL query logging,
		},
		monitoringConfiguration: { noMonitoring: true },
		rules: [
			{
				schedule: Schedule.rate(Duration.days(1)),
			},
		],
		runtime: Runtime.NODEJS_18_X,
	});

	db.grantConnect(lambda, 'dataaudit');
	lambda.addToRolePolicy(listOrgsPolicy);

	// Use the same IAM Role that CloudQuery uses to eliminate permission issues being the cause of data difference
	lambda.addToRolePolicy(cloudqueryAccess('*'));
}
