import type {
	Anghammarad,
	AnghammaradNotification,
	Target,
} from '@guardian/anghammarad';
import { RequestedChannel } from '@guardian/anghammarad';
import type { AwsOrganizationsAccounts } from 'common/types.js';
import type { Config } from '../config.js';
import type { BreakglassUser } from './types.js';

function formatUser(user: BreakglassUser): string {
	const mfaString = user.mfaActive ? '' : 'MFA not active';
	const tagString = user.hasUsernameTag ? '' : 'GoogleUsername tag not present';

	const issues = [mfaString, tagString].filter(Boolean).join(', ');
	return `[${user.user}](${user.userUrl}) - ${issues}.`;
}

export function formatMessage(users: BreakglassUser[]): string {
	return users.map(formatUser).join('\n');
}

export async function sendAnghammaradNotification(
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
						cta: 'Full breakglass user report',
						url: `https://metrics.gutools.co.uk/d/bdn97cui5rbi8f?var-account_name=${encodeURIComponent(account.name)}`,
					},
					{
						cta: 'Breakglass user setup guide',
						url: 'https://docs.google.com/document/d/1Jyx51PcBR-H8quAv944fC5eKLNsI9iLWQDG6Le0sGHQ',
					},
				],
				target,
				sender: `Cloudbuster ${config.stage}`,
				channel: RequestedChannel.PreferHangouts,
				threadKey: `breakglass-${new Date().toISOString().split('T')[0]}`,
			};
			await anghammaradClient.notify(notification);
		}),
	);
}
