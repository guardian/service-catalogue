import type { MetricDatum } from '@aws-sdk/client-cloudwatch';
import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';
import { PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
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
	const [stack, stage, app] = [config.stack, config.stage, config.app];
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
			Namespace: config.app,
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

	const report: BreakglassUser[] = createBreakglassUserReport(
		credentialReports,
		awsAccounts,
		iamUsers,
	);

	await createBreakglassUserMetric(report, config, awsConfig);

	console.table(
		report.map(({ user, accountName, mfaActive, hasUsernameTag }) => ({
			user,
			accountName,
			mfaActive,
			hasUsernameTag,
		})),
	);

	interface UsersPerAccount {
		acctId: string;
		acctName: string;
		users: BreakglassUser[];
	}

	const usersPerAccount: UsersPerAccount[] = awsAccounts
		.map((account) => ({
			acctId: account.id,
			acctName: account.name,
			users: report
				.filter((user) => user.accountName === account.name)
				.map((user) => user),
		}))
		.filter((account) => account.users.length > 0);

	console.table(
		usersPerAccount.map(({ acctName, users }) => ({
			acctName,
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
				subject: `Breakglass User Report: ${account.acctName}`,
				message: `${account.users.length} breakglass users are missing security configuration\n\n${formatMessage(account.users)}`,
				actions: [
					{
						cta: 'View breakglass user report',
						url: `https://metrics.gutools.co.uk/d/bdn97cui5rbi8f?var-account_name=${encodeURIComponent(account.acctName)}`,
					},
				],
				target,
				sender: `Cloudbuster ${config.stage}`,
				channel: RequestedChannel.PreferHangouts,
			};
			await anghammaradClient.notify(notification);
		}),
	);

	return report;
}
