import type {
	Anghammarad,
	AnghammaradNotification,
	Target,
} from '@guardian/anghammarad';
import { RequestedChannel } from '@guardian/anghammarad';
import { logger } from 'common/logs.js';
import type { AwsOrganizationsAccounts } from 'common/types.js';
import type { Config } from '../config.js';
import type { BreakglassUser } from './types.js';

type VariableAnghammaradFields = Pick<
	AnghammaradNotification,
	'subject' | 'message' | 'actions' | 'target'
>;

type UsersPerAccount = {
	name: string;
	id: string;
	users: BreakglassUser[];
};

function formatUser(user: BreakglassUser): string {
	const mfaString = user.mfaActive ? '' : 'MFA not active';
	const tagString = user.hasUsernameTag ? '' : 'GoogleUsername tag not present';

	const issues = [mfaString, tagString].filter(Boolean).join(', ');
	return `[${user.user}](${user.userUrl}) - ${issues}.`;
}

export function formatMessage(users: BreakglassUser[]): string {
	return users.map(formatUser).join('\n');
}

function groupUsersByAccount(
	users: BreakglassUser[],
	awsAccounts: AwsOrganizationsAccounts[],
): UsersPerAccount[] {
	const usersPerAccount = awsAccounts
		.map(({ name, id }) => ({
			name,
			id,
			users: users.filter((user) => user.accountName === name),
		}))
		.filter(({ users }) => users.length > 0);

	console.table(
		usersPerAccount.map(({ name, users }) => ({
			name,
			nonCompliantUsers: users.length,
		})),
	);

	return usersPerAccount;
}

function createNotificationFields(
	accountName: string,
	accountId: string,
	stage: string,
	users: BreakglassUser[],
): VariableAnghammaradFields {
	const subject = `Breakglass User Report: ${accountName}`;
	const message = `${users.length} breakglass users are missing security configuration\n\n${formatMessage(users)}`;
	const actions = [
		{
			cta: 'Full breakglass user report',
			url: `https://metrics.gutools.co.uk/d/bdn97cui5rbi8f?var-account_name=${encodeURIComponent(accountName)}`,
		},
		{
			cta: 'Breakglass user setup guide',
			url: 'https://docs.google.com/document/d/1Jyx51PcBR-H8quAv944fC5eKLNsI9iLWQDG6Le0sGHQ',
		},
	];

	const target: Target =
		stage === 'PROD' ? { AwsAccount: accountId } : { Stack: 'testing-alerts' };
	return { subject, message, actions, target };
}

export function groupUsersAndCreateNotifications(
	users: BreakglassUser[],
	awsAccounts: AwsOrganizationsAccounts[],
	stage: string,
): VariableAnghammaradFields[] {
	const usersPerAccount = groupUsersByAccount(users, awsAccounts);
	return usersPerAccount.map(({ name, id, users }) =>
		createNotificationFields(name, id, stage, users),
	);
}

export async function sendAnghammaradNotification(
	config: Config,
	awsAccounts: AwsOrganizationsAccounts[],
	report: BreakglassUser[],
	anghammaradClient: Anghammarad,
) {
	const date = new Date().toISOString().split('T')[0];

	const fixedFields = {
		sender: `Cloudbuster ${config.stage}`,
		threadKey: `breakglass-${date}`,
		channel: RequestedChannel.PreferHangouts,
	};

	const variableFields: VariableAnghammaradFields[] =
		groupUsersAndCreateNotifications(report, awsAccounts, config.stage);

	const isThursday = new Date().getDay() === 4;

	if (config.enableMessaging && isThursday) {
		await Promise.all(
			variableFields.map(async (fields) => {
				const notification: AnghammaradNotification = {
					...fixedFields,
					...fields,
				};
				await anghammaradClient.notify(notification);
			}),
		);
	} else {
		logger.log({
			message: `Skipping sending breakglass user notifications. Is Thursday: ${isThursday}, enableMessaging: ${config.enableMessaging}`,
		});
	}
}
