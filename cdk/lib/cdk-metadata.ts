import { join } from 'path';
import { GuDistributionBucketParameter, GuStackProps, GuAnghammaradTopicParameter } from '@guardian/cdk/lib/constructs/core';
import { GuScheduledLambda } from '@guardian/cdk/lib/patterns/scheduled-lambda'
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { App, Duration } from 'aws-cdk-lib';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';

export class CdkMetadata extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		new GuScheduledLambda(this, "lambda", {
			app: "TODO",
			rules: [{
				schedule: Schedule.rate(Duration.days(1)),
				description: "Run daily."
			}],
			runtime: Runtime.GO_1_X,
			handler: "main",
			fileName: "lambda.zip",
			monitoringConfiguration: { noMonitoring: true } // FIXME
		})
	}
}
