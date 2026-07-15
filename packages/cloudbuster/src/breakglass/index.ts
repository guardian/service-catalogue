import type { MetricDatum } from '@aws-sdk/client-cloudwatch';
import {
	CloudWatchClient,
	PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import type {
	Anghammarad,
	AnghammaradNotification,
	Target,
} from '@guardian/anghammarad';
import { RequestedChannel } from '@guardian/anghammarad';
import type { AwsClientConfig } from 'common/aws.js';
import {
	getAwsAccounts,
	getIamCredentialReports,
	getIamUsers,
} from 'common/database-queries.js';
import type { PrismaClient } from 'common/prisma-client/client.js';
import type { AwsOrganizationsAccounts } from 'common/types.js';
import type { Config } from '../config.js';
import { formatMessage } from './digests.js';
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

async function sendAnghammaradNotification(
	config: Config,
	awsAccounts: AwsOrganizationsAccounts[],
	report: BreakglassUser[],
	anghammaradClient: Anghammarad,
) {
	const usersPerAccount = awsAccounts
		.map(({ name }) => ({
			name,
			users: report.filter((user) => user.accountName === name),
		}))
		.filter(({ users }) => users.length > 0);

	console.table(
		usersPerAccount.map(({ name, users }) => ({
			name,
			numUsers: users.length,
			users: users.map((u) => u.user).join(', '),
		})),
	);

	const target: Target =
		config.stage === 'PROD'
			? { Stack: 'security' }
			: { Stack: 'testing-alerts' };

	await Promise.all(
		usersPerAccount.map(async (account) => {
			const notification: AnghammaradNotification = {
				subject: `Breakglass User Report: ${account.name}`,
				message: `${account.users.length} breakglass users are missing security configuration\n\n${formatMessage(account.users)}`,
				actions: [
					{
						cta: 'View breakglass user report',
						url: `https://metrics.gutools.co.uk/d/bdn97cui5rbi8f/var-account_name=${account.name}`,
					},
				],
				target,
				sender: `Cloudbuster ${config.stage}`,
				channel: RequestedChannel.PreferHangouts,
			};
			await anghammaradClient.notify(notification);
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
