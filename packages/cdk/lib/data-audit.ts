import { GuScheduledLambda } from '@guardian/cdk';
import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { Duration } from 'aws-cdk-lib';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export function addDataAuditLambda(scope: GuStack) {
	const app = 'data-audit';
	new GuScheduledLambda(scope, 'DataAudit', {
		app,
		fileName: `${app}.zip`,
		handler: 'index.main',
		monitoringConfiguration: { noMonitoring: true },
		rules: [
			{
				schedule: Schedule.rate(Duration.days(1)),
			},
		],
		runtime: Runtime.NODEJS_18_X,
	});
}
