import type {
	Anghammarad,
	AnghammaradNotification,
	Target,
} from '@guardian/anghammarad';
import { RequestedChannel } from '@guardian/anghammarad';
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

export async function sendBreakglassUserAlerts(
	config: Config,
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

	//TODO store user count as a cloudwatch metric

	console.table(
		report.map(({ user, mfaActive, hasUsernameTag }) => ({
			user,
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
						url: `https://metrics.gutools.co.uk/d/bdn97cui5rbi8f/var-account_name=${account.acctName}`,
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
