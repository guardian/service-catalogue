/**
 * Seed fixtures for exercising cloudbuster's breakglass user report locally.
 *
 * Produces IAM users and credential reports covering the report's decision
 * matrix:
 *   - correctly configured (GoogleUsername tag + MFA)  → excluded from report
 *   - missing GoogleUsername tag                        → included
 *   - missing MFA                                       → included
 *   - missing both                                      → included
 *
 * A single `aws_organizations_accounts` row is seeded so the report can look
 * up an account name for the credential reports.
 */
import { Prisma } from '../../prisma-client/client.js';
import { createSeedMetadata } from './seed-helpers.js';

const breakglassAccountId = '000000000001';
const breakglassAccountName = 'service-catalogue-dev-account';
const breakglassAccountEmail = 'service-catalogue-dev@example.com';

interface BreakglassUserFixture {
	userName: string;
	hasGoogleUsernameTag: boolean;
	mfaActive: boolean;
}

const breakglassUserFixtures: readonly BreakglassUserFixture[] = [
	{
		userName: 'alice-correctly-configured',
		hasGoogleUsernameTag: true,
		mfaActive: true,
	},
	{
		userName: 'bob-missing-googleusername-tag',
		hasGoogleUsernameTag: false,
		mfaActive: true,
	},
	{
		userName: 'charlie-missing-mfa',
		hasGoogleUsernameTag: true,
		mfaActive: false,
	},
	{
		userName: 'dave-missing-tag-and-mfa',
		hasGoogleUsernameTag: false,
		mfaActive: false,
	},
];

const userArn = (userName: string): string =>
	`arn:aws:iam::${breakglassAccountId}:user/${userName}`;

function createIamUser(
	fixture: BreakglassUserFixture,
): Prisma.aws_iam_usersCreateManyInput {
	const tags: Prisma.InputJsonValue = fixture.hasGoogleUsernameTag
		? { GoogleUsername: `${fixture.userName}@example.com` }
		: { SomeOtherTag: 'value' };

	return {
		...createSeedMetadata(),
		account_id: breakglassAccountId,
		arn: userArn(fixture.userName),
		user_name: fixture.userName,
		user_id: `AIDA${fixture.userName.toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
		path: '/',
		create_date: new Date('2023-01-01T00:00:00Z'),
		tags,
		password_last_used: null,
		permissions_boundary: Prisma.DbNull,
	};
}

function createIamCredentialReport(
	fixture: BreakglassUserFixture,
): Prisma.aws_iam_credential_reportsCreateManyInput {
	return {
		...createSeedMetadata(),
		account_id: breakglassAccountId,
		arn: userArn(fixture.userName),
		user: fixture.userName,
		password_enabled: 'true',
		mfa_active: fixture.mfaActive,
		user_creation_time: new Date('2023-01-01T00:00:00Z'),
	};
}

function createOrganizationsAccount(): Prisma.aws_organizations_accountsCreateManyInput {
	return {
		...createSeedMetadata(),
		request_account_id: breakglassAccountId,
		arn: `arn:aws:organizations::${breakglassAccountId}:account/o-seed/${breakglassAccountId}`,
		id: breakglassAccountId,
		name: breakglassAccountName,
		email: breakglassAccountEmail,
		status: 'ACTIVE',
		joined_timestamp: new Date('2023-01-01T00:00:00Z'),
	};
}

export interface BreakglassSeedData {
	iamUsers: Prisma.aws_iam_usersCreateManyInput[];
	iamCredentialReports: Prisma.aws_iam_credential_reportsCreateManyInput[];
	organizationsAccounts: Prisma.aws_organizations_accountsCreateManyInput[];
}

/**
 * Builds Prisma createMany payloads for the seeded IAM users, credential
 * reports and organisations account used by the breakglass report.
 */
export function buildBreakglassSeedData(): BreakglassSeedData {
	return {
		iamUsers: breakglassUserFixtures.map(createIamUser),
		iamCredentialReports: breakglassUserFixtures.map(createIamCredentialReport),
		organizationsAccounts: [createOrganizationsAccount()],
	};
}
