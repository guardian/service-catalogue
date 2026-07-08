import type {
	aws_accounts,
	aws_iam_credential_reports,
	aws_iam_users,
} from 'common/prisma-client/client.js';

export interface BreakglassUser {
	accountName: string | null;
	user: string | null;
	userUrl: string | null;
	mfaActive: boolean | null;
	hasUsernameTag: boolean;
}

/**
 * Extracts the 12-digit AWS account id from an IAM ARN.
 * ARNs have the form `arn:aws:iam::<account-id>:<resource>`, so the account id
 * is the 5th colon-delimited segment.
 * E.g. `arn:aws:iam::123456789012:user/alice` -> `123456789012`.
 */
function accountIdFromArn(arn: string | null): string | null {
	return arn?.split(':')[4] ?? null;
}

/**
 * Builds the breakglass user report by joining IAM credential reports to their
 * AWS account and IAM user records, filtering to users that have passwords.
 */
export function createBreakglassUserReport(
	credentialReports: aws_iam_credential_reports[],
	awsAccounts: aws_accounts[],
	iamUsers: aws_iam_users[],
): BreakglassUser[] {
	const accountsById = new Map(awsAccounts.map((a) => [a.id, a]));
	const usersByArn = new Map(iamUsers.map((u) => [u.arn, u]));

	return credentialReports
		.filter((cr) => cr.password_enabled === 'true')
		.map((cr) => {
			const accountId = accountIdFromArn(cr.arn);
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
