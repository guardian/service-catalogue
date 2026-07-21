import assert from 'assert';
import { describe, it } from 'node:test';
import type { AwsOrganizationsAccounts } from 'common/types.js';
import { formatMessage, groupUsersAndCreateNotifications } from './digests.js';
import type { BreakglassUser } from './types.js';

const compliantUser: BreakglassUser = {
	accountName: 'my-account',
	user: 'testuser',
	userUrl: 'https://example.com/testuser',
	mfaActive: true,
	hasUsernameTag: true,
};

void describe('The noncompliant breakglass users message', () => {
	void it('should format one user with no MFA', () => {
		const user: BreakglassUser = {
			...compliantUser,
			mfaActive: false,
		};
		const actual = formatMessage([user]);
		const expected =
			'[testuser](https://example.com/testuser) - MFA not active.';
		assert.strictEqual(actual, expected);
	});

	void it('should format a user failing both checks', () => {
		const user: BreakglassUser = {
			...compliantUser,
			mfaActive: false,
			hasUsernameTag: false,
		};
		const actual = formatMessage([user]);
		const expected =
			'[testuser](https://example.com/testuser) - MFA not active, GoogleUsername tag not present.';
		assert.strictEqual(actual, expected);
	});

	void it('should return multiple lines for multiple failing users', () => {
		const user1: BreakglassUser = {
			...compliantUser,
			mfaActive: false,
		};
		const user2: BreakglassUser = {
			...compliantUser,
			user: 'anotheruser',
			userUrl: 'https://example.com/anotheruser',
			mfaActive: false,
			hasUsernameTag: false,
		};
		const actual = formatMessage([user1, user2]);
		const expected =
			'[testuser](https://example.com/testuser) - MFA not active.\n' +
			'[anotheruser](https://example.com/anotheruser) - MFA not active, GoogleUsername tag not present.';
		assert.strictEqual(actual, expected);
		assert.ok(actual.includes('\n'));
	});
});

void describe('Breakglass notification grouping', () => {
	const nonCompliantUser: BreakglassUser = {
		...compliantUser,
		mfaActive: false,
		hasUsernameTag: false,
	};

	void it('should create a notification for an account with one noncompliant user', () => {
		const user = { ...nonCompliantUser, accountName: 'security' };
		const accounts: AwsOrganizationsAccounts[] = [
			{ id: '123456789012', name: 'security' },
		];
		const actual = groupUsersAndCreateNotifications([user], accounts);

		assert.strictEqual(actual.length, 1);
	});

	void it('should group users from the same account into one notification', () => {
		const users: BreakglassUser[] = [
			{ ...nonCompliantUser, accountName: 'platform' },
			{
				...nonCompliantUser,
				accountName: 'platform',
				user: 'anotheruser',
				userUrl: 'https://example.com/anotheruser',
			},
		];
		const accounts = [{ id: '234567890123', name: 'platform' }];
		const actual = groupUsersAndCreateNotifications(users, accounts);

		assert.strictEqual(actual.length, 1);
		assert.match(actual[0]!.message, /2 breakglass users/);
	});

	void it('should omit an existing account with no noncompliant users', () => {
		const users = [{ ...nonCompliantUser, accountName: 'security' }];
		const accounts = [
			{ id: '456789012345', name: 'account-with-no-report-users' },
		];
		const actual = groupUsersAndCreateNotifications(users, accounts);

		assert.deepStrictEqual(actual, []);
	});
});
