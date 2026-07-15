import type { MetricDatum } from '@aws-sdk/client-cloudwatch';
import {
	CloudWatchClient,
	PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import type { Anghammarad } from '@guardian/anghammarad';
import type { AwsClientConfig } from 'common/aws.js';
import {
	getAwsAccounts,
	getIamCredentialReports,
	getIamUsers,
} from 'common/database-queries.js';
import type { PrismaClient } from 'common/prisma-client/client.js';
import type { Config } from '../config.js';
import { sendAnghammaradNotification } from './digests.js';
import { createBreakglassUserReport } from './findings.js';
import type { BreakglassUser } from './types.js';

async function createBreakglassUserMetric(
	noncompliantUsers: BreakglassUser[],
	config: Config,
	awsClientConfig: AwsClientConfig,
) {
	const client = new CloudWatchClient(awsClientConfig);
	const { stack, stage, app } = config;
	const Dimensions = [
		{ Name: 'Stack', Value: stack },
		{ Name: 'Stage', Value: stage },
		{ Name: 'App', Value: app },
	];

	const metric: MetricDatum = {
		MetricName: 'NoncompliantBreakglassUsers',
		Value: noncompliantUsers.length,
		Dimensions,
	};

	console.log('Sending metrics to Cloudwatch');

	await client.send(
		new PutMetricDataCommand({
			Namespace: app,
			MetricData: [metric],
		}),
	);
}

export async function sendBreakglassUserAlerts(
	config: Config,
	awsConfig: AwsClientConfig,
	prisma: PrismaClient,
	anghammaradClient: Anghammarad,
) {
	const [credentialReports, awsAccounts, iamUsers] = await Promise.all([
		getIamCredentialReports(prisma),
		getAwsAccounts(prisma),
		getIamUsers(prisma),
	]);

	const report = createBreakglassUserReport(
		credentialReports,
		awsAccounts,
		iamUsers,
	);

	console.table(
		report.map(({ user, accountName, mfaActive, hasUsernameTag }) => ({
			user,
			accountName,
			mfaActive,
			hasUsernameTag,
		})),
	);

	await createBreakglassUserMetric(report, config, awsConfig);

	await sendAnghammaradNotification(
		config,
		awsAccounts,
		report,
		anghammaradClient,
	);

	return report;
}
