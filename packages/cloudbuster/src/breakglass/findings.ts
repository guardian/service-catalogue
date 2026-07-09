import type {
	AwsIamCredentialReport,
	AwsIamUser,
	AwsOrganizationsAccounts,
} from 'common/types.js';
import type { BreakglassUser } from './types.js';

/**
 * Builds the breakglass user report by joining IAM credential reports to their
 * AWS account and IAM user records, filtering to users that have passwords.
 */
export function createBreakglassUserReport(
	credentialReports: AwsIamCredentialReport[],
	awsAccounts: AwsOrganizationsAccounts[],
	iamUsers: AwsIamUser[],
): BreakglassUser[] {
	const accountsById = new Map(awsAccounts.map((a) => [a.id, a]));
	const usersByArn = new Map(iamUsers.map((u) => [u.arn, u]));

	return credentialReports
		.filter((cr) => cr.password_enabled === 'true')
		.map((cr) => {
			const accountId = cr.account_id;
			const account = accountId ? accountsById.get(accountId) : undefined;
			const user = cr.arn ? usersByArn.get(cr.arn) : undefined;
			const tags = user?.tags as Record<string, string> | null | undefined;

			return {
				accountName: account?.name ?? 'unknown',
				user: cr.user,
				userUrl: `https://console.aws.amazon.com/iam/home#/users/${cr.user}`,
				mfaActive: cr.mfa_active,
				hasUsernameTag: !!tags?.['GoogleUsername'],
			};
		})
		.sort((a, b) => a.accountName.localeCompare(b.accountName))
		.filter((user) => !user.hasUsernameTag || !user.mfaActive);
}
