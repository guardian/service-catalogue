import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuVpc, SubnetType } from '@guardian/cdk/lib/constructs/ec2';
import { GuScheduledLambda } from '@guardian/cdk/lib/patterns/scheduled-lambda';
import type { App } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export class Repocop extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);
		const repoCopApp = 'repocop';
		new GuScheduledLambda(this, `${repoCopApp}-lambda`, {
			app: repoCopApp,
			runtime: Runtime.JAVA_11,
			memorySize: 512,
			handler: 'com.gu.repocop.Handler::handler',
			fileName: `${repoCopApp}.jar`,
			monitoringConfiguration: {
				toleratedErrorPercentage: 0,
				snsTopicName: 'devx-alerts',
			},
			rules: [{ schedule: Schedule.cron({ minute: '0', hour: '8' }) }],
			timeout: Duration.seconds(300),
			vpc: GuVpc.fromIdParameter(this, 'deployToolsVPC'),
			vpcSubnets: {
				subnets: GuVpc.subnetsFromParameter(this, {
					type: SubnetType.PRIVATE,
					app: repoCopApp,
				}),
			},
		});
	}
}
