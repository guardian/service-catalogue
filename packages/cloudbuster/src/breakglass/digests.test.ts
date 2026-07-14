import assert from 'assert';
import { describe, it } from 'node:test';
import { formatMessage } from './digests.js';
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
