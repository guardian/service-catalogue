import type {
	aws_iam_credential_reports,
	aws_iam_users,
	aws_organizations_accounts,
} from 'common/prisma-client/client.js';

export interface BreakglassUser {
	accountName: string | null;
	user: string | null;
	userUrl: string | null;
	mfaActive: boolean | null;
	hasUsernameTag: boolean;
}

/**
 * Builds the breakglass user report by joining IAM credential reports to their
 * AWS account and IAM user records, filtering to users that have passwords.
 */
export function createBreakglassUserReport(
	credentialReports: aws_iam_credential_reports[],
	awsAccounts: aws_organizations_accounts[],
	iamUsers: aws_iam_users[],
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
				accountName: account?.name ?? null,
				user: cr.user,
				userUrl: cr.user
					? `https://console.aws.amazon.com/iam/home#/users/${cr.user}`
					: null,
				mfaActive: cr.mfa_active,
				hasUsernameTag: tags?.['GoogleUsername'] != null,
			};
		})
		.sort((a, b) => (a.accountName ?? '').localeCompare(b.accountName ?? ''))
		.filter((user) => !user.hasUsernameTag || !user.mfaActive);
}
