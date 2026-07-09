import assert from 'assert';
import { describe, it } from 'node:test';
import type {
	AwsIamCredentialReport,
	AwsIamUser,
	AwsOrganizationsAccounts,
} from 'common/types.js';
import { createBreakglassUserReport } from './findings.js';
import type { BreakglassUser } from './types.js';

function credentialReport(
	overrides: Partial<AwsIamCredentialReport>,
): AwsIamCredentialReport {
	return {
		arn: 'arn:aws:iam::123456789012:user/alice',
		password_enabled: 'true',
		user: 'alice',
		mfa_active: true,
		account_id: '123456789012',
		...overrides,
	};
}

function awsAccount(
	overrides: Partial<AwsOrganizationsAccounts>,
): AwsOrganizationsAccounts {
	return {
		id: '123456789012',
		name: 'my-account',
		...overrides,
	};
}

function iamUser(overrides: Partial<AwsIamUser>): AwsIamUser {
	return {
		account_id: '123456789012',
		arn: 'arn:aws:iam::123456789012:user/alice',
		tags: { GoogleUsername: 'alice.smith' },
		user_name: 'alice',
		...overrides,
	};
}

void describe('createBreakglassUserReport', () => {
	void it('joins credential reports to accounts and users', () => {
		const report = createBreakglassUserReport(
			[credentialReport({ mfa_active: false })],
			[awsAccount({})],
			[iamUser({})],
		);

		const expected: BreakglassUser = {
			accountName: 'my-account',
			user: 'alice',
			userUrl: 'https://console.aws.amazon.com/iam/home#/users/alice',
			mfaActive: false,
			hasUsernameTag: true,
		};

		assert.deepStrictEqual(report, [expected]);
	});

	void it('only includes users with passwords', () => {
		const report = createBreakglassUserReport(
			[
				credentialReport({
					user: 'alice',
					password_enabled: 'true',
					mfa_active: false,
				}),
				credentialReport({
					user: 'bob',
					arn: 'arn:aws:iam::123456789012:user/bob',
					password_enabled: 'false',
					mfa_active: false,
				}),
			],
			[awsAccount({})],
			[iamUser({})],
		);

		assert.strictEqual(report.length, 1);
		assert.strictEqual(report[0]!.user, 'alice');
	});

	void it('excludes users that have both MFA enabled and a GoogleUsername tag', () => {
		const report = createBreakglassUserReport(
			[credentialReport({ mfa_active: true })],
			[awsAccount({})],
			[iamUser({ tags: { GoogleUsername: 'alice.smith' } })],
		);

		assert.deepStrictEqual(report, []);
	});

	void it('includes users that have a GoogleUsername tag but no MFA', () => {
		const report = createBreakglassUserReport(
			[credentialReport({ mfa_active: false })],
			[awsAccount({})],
			[iamUser({ tags: { GoogleUsername: 'alice.smith' } })],
		);

		assert.strictEqual(report.length, 1);
		assert.strictEqual(report[0]!.mfaActive, false);
		assert.strictEqual(report[0]!.hasUsernameTag, true);
	});

	void it('includes users that have MFA but no GoogleUsername tag', () => {
		const report = createBreakglassUserReport(
			[credentialReport({ mfa_active: true })],
			[awsAccount({})],
			[iamUser({ tags: { SomeOtherTag: 'value' } })],
		);

		assert.strictEqual(report.length, 1);
		assert.strictEqual(report[0]!.mfaActive, true);
		assert.strictEqual(report[0]!.hasUsernameTag, false);
	});

	void it('includes users that have neither MFA nor a GoogleUsername tag', () => {
		const report = createBreakglassUserReport(
			[credentialReport({ mfa_active: false })],
			[awsAccount({})],
			[iamUser({ tags: { SomeOtherTag: 'value' } })],
		);

		assert.strictEqual(report.length, 1);
		assert.strictEqual(report[0]!.mfaActive, false);
		assert.strictEqual(report[0]!.hasUsernameTag, false);
	});

	void it('reports hasUsernameTag as false when no matching user is found', () => {
		const report = createBreakglassUserReport(
			[credentialReport({})],
			[awsAccount({})],
			[],
		);

		const expected: BreakglassUser = {
			accountName: 'my-account',
			user: 'alice',
			userUrl: 'https://console.aws.amazon.com/iam/home#/users/alice',
			mfaActive: true,
			hasUsernameTag: false,
		};

		assert.deepStrictEqual(report, [expected]);
	});

	void it('reports hasUsernameTag as false when the user has no GoogleUsername tag', () => {
		const report = createBreakglassUserReport(
			[credentialReport({})],
			[awsAccount({})],
			[iamUser({ tags: { SomeOtherTag: 'value' } })],
		);

		const expected: BreakglassUser = {
			accountName: 'my-account',
			user: 'alice',
			userUrl: 'https://console.aws.amazon.com/iam/home#/users/alice',
			mfaActive: true,
			hasUsernameTag: false,
		};

		assert.deepStrictEqual(report, [expected]);
	});

	void it('sorts the report by account name', () => {
		const report = createBreakglassUserReport(
			[
				credentialReport({
					user: 'alice',
					arn: 'arn:aws:iam::111111111111:user/alice',
					account_id: '111111111111',
				}),
				credentialReport({
					user: 'bob',
					arn: 'arn:aws:iam::222222222222:user/bob',
					account_id: '222222222222',
				}),
			],
			[
				awsAccount({ id: '222222222222', name: 'aardvark-account' }),
				awsAccount({ id: '111111111111', name: 'zebra-account' }),
			],
			[],
		);

		assert.deepStrictEqual(
			report.map((r) => r.accountName),
			['aardvark-account', 'zebra-account'],
		);
	});
});
