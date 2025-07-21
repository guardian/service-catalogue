import  assert from 'assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import type { SNSEvent } from 'aws-lambda';
import {
	anghammaradThreadKey,
	branchProtectionCtas,
	daysLeftToFix,
	getEnvOrThrow,
	getGithubAppSecret,
	isWithinSlaTime,
	parseEvent,
	parseSecretJson,
	partition,
	stringToSeverity,
	toNonEmptyArray,
	topicMonitoringProductionTagCtas,
} from './functions';
import type { NonEmptyArray } from './types';

function isValidUrl(str: string) {
	try {
		new URL(str);
		return true;
	} catch (err) {
		return false;
	}
}

void describe('branchProtectionCtas', () => {
	void it('should return an array of three valid urls', () => {
		const fullRepoName = 'my-org/my-repo';
		const teamSlug = 'my-team';
		const result = branchProtectionCtas(fullRepoName, teamSlug);
		assert.strictEqual(result.length, 3);
		assert.strictEqual(result.every((x) => isValidUrl(x.url)), true);
	});

	void it('should return the correct urls in the correct order', () => {
		const fullRepoName = 'my-org/my-repo';
		const teamSlug = 'my-team';
		const result = branchProtectionCtas(fullRepoName, teamSlug);
		assert.deepStrictEqual(result.map((x) => x.url), [
			'https://github.com/my-org/my-repo',
			'https://metrics.gutools.co.uk/d/EOPnljWIz/repocop-compliance?var-team=my-team&var-rule=All&orgId=1',
			'https://github.com/my-org/my-repo/settings/branches',
		]);
	});
});

void describe('topicMonitoringProductionTagCtas', () => {
	void it('should return an array of four valid urls', () => {
		const fullRepoName = 'my-org/my-repo';
		const teamSlug = 'my-team';
		const result = topicMonitoringProductionTagCtas(fullRepoName, teamSlug);
		assert.strictEqual(result.length, 4);
		assert.strictEqual(result.every((x) => isValidUrl(x.url)), true)
	});

	void it('should return the correct urls in the correct order', () => {
		const fullRepoName = 'my-org/my-repo';
		const teamSlug = 'my-team';
		const result = topicMonitoringProductionTagCtas(fullRepoName, teamSlug);
		assert.deepStrictEqual(result.map((x) => x.url), [
			'https://github.com/my-org/my-repo',
			'https://github.com/guardian/service-catalogue/blob/main/packages/best-practices/best-practices.md',
			'https://metrics.gutools.co.uk/d/EOPnljWIz/repocop-compliance?var-team=my-team&var-rule=All&orgId=1',
			'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics#adding-topics-to-your-repository',
		]);
	});
});

void describe('anghammaradThreadKey', () => {
	void it('should return a the expected string, with no slashes', () => {
		const fullRepoName = 'my-org/my-repo';
		const result = anghammaradThreadKey(fullRepoName);
		assert.strictEqual(result, 'service-catalogue-my-org-my-repo')
	});
});

void describe('parseSecretJson', () => {
	void it('should parse a valid JSON string', () => {
		const secretString =
			'{"installationId":"installation1","clientSecret":"secret1","appId":"app1","base64PrivateKey":"aGVsbG8K"}';
		const result = parseSecretJson(secretString);
		assert.strictEqual(result.installationId, 'installation1');
		assert.strictEqual(result.strategyOptions.clientSecret, 'secret1');
		assert.strictEqual(result.strategyOptions.appId, 'app1');
		assert.strictEqual(result.strategyOptions.privateKey, 'hello\n');
	});

	void it('should throw an error for an invalid JSON string', () => {
		const secretString = 'not a JSON string';
		assert.throws(() => parseSecretJson(secretString));
	});
});

void describe('getEnvOrThrow', () => {
	void it('should return the value of an existing environment variable', () => {
		process.env.TEST_VAR = 'test value';
		assert.strictEqual(getEnvOrThrow('TEST_VAR'), 'test value');
	});

	void it('should throw an error for a non-existing environment variable', () => {
		const err = { message: 'Environment variable NON_EXISTING_VAR is not set.' };
		assert.throws(() => getEnvOrThrow('NON_EXISTING_VAR'), err);
	});
});

void describe('getGitHubAppSecret', () => {
	void it('should throw if the GITHUB_APP_SECRET environment variable is not set', async () => {
		const err = { message: 'Environment variable GITHUB_APP_SECRET is not set.' };
		const secret = process.env.GITHUB_APP_SECRET;
		delete process.env.GITHUB_APP_SECRET;
		await assert.rejects(getGithubAppSecret, err);
		process.env.GITHUB_APP_SECRET = secret;
	});
});

void describe('parseSecretJson', () => {
	void it('put the right values in the right fields, if the JSON string has the correct fields', () => {
		const actual = parseSecretJson(
			'{"appId": "myAppId", "base64PrivateKey": "aGVsbG8=", "clientId": "myClientId", "clientSecret": "myClientSecret", "installationId": "myInstallationId"}',
		);
		//check that the correct fields are in the correct values, and that base64PrivateKey has been decoded
		assert.strictEqual(actual.installationId, 'myInstallationId');
		assert.strictEqual(actual.strategyOptions.appId, 'myAppId');
		assert.strictEqual(actual.strategyOptions.clientId, 'myClientId');
		assert.strictEqual(actual.strategyOptions.clientSecret, 'myClientSecret');
		assert.strictEqual(actual.strategyOptions.installationId, 'myInstallationId');
		assert.strictEqual(actual.strategyOptions.privateKey, 'hello');
	});
	void it('should throw an error if the input string is not valid JSON', () => {
		const input = 'not valid JSON';
		assert.throws(() => parseSecretJson(input));
	});
	void it('should throw an error if the input string is not a valid GithubAppSecret', () => {
		const input = '{"not": "a valid GithubAppSecret"}';
		assert.throws(() => parseSecretJson(input));
	});
});

void describe('partitioning an array', () => {
	void it('should split it into two arrays based on a predicate', () => {
		const input = [1, 2, 1, 3, 1, 4];
		const predicate = (x: number) => x === 1;
		const [truthy, falsy] = partition(input, predicate);
		assert.deepStrictEqual(truthy, [1, 1, 1]);
		assert.deepStrictEqual(falsy, [2, 3, 4]);
	});
});

void describe('Unwrapping an SNS message', () => {
	function eventWithMessage(msg: string): SNSEvent {
		return {
			Records: [
				{
					EventSource: 'aws:sns',
					EventVersion: '1.0',
					EventSubscriptionArn: '',
					Sns: {
						Message: msg,
						SignatureVersion: '',
						Timestamp: '',
						Signature: '',
						SigningCertUrl: '',
						MessageId: '',
						MessageAttributes: {},
						Type: '',
						UnsubscribeUrl: '',
						TopicArn: '',
					},
				},
			],
		};
	}
	interface MyEvent {
		myString: string;
		myArray: string[];
	}

	void it('should generate a result of the expected type', () => {
		const outputEvent: MyEvent = {
			myString: 'hello',
			myArray: ['how', 'are', 'you', '?'],
		};

		const inputMsg = '{"myString":"hello","myArray":["how","are","you","?"]}';
		const inputEvent = eventWithMessage(inputMsg);
		assert.deepStrictEqual(parseEvent<MyEvent>(inputEvent), [outputEvent]);
	});

	void it('should throw an error if the input message is not valid JSON', () => {
		const inputMsg = '{"myString":"goodbye","myArray":["how","are","you","?]}';
		const inputEvent = eventWithMessage(inputMsg);
		assert.throws(() => parseEvent<MyEvent>(inputEvent));
	});
});

void describe('stringToSeverity', () => {
	void it ('should return unknown if it is passed an unexpected string', () => {
		assert.strictEqual(stringToSeverity('foo'), 'unknown');
	});

	void it('should return the correct severity for valid inputs', () => {
		assert.strictEqual(stringToSeverity('low'), 'low');
		assert.strictEqual(stringToSeverity('medium'), 'medium');
		assert.strictEqual(stringToSeverity('high'), 'high');
		assert.strictEqual(stringToSeverity('critical'), 'critical');
	});

	void it('Should handle unusual capitalisation gracefully', () => {
		assert.strictEqual(stringToSeverity('LOW'), 'low');
		assert.strictEqual(stringToSeverity('MeDiUm'), 'medium');
		assert.strictEqual(stringToSeverity('HIGH'), 'high');
		assert.strictEqual(stringToSeverity('CRITICAL'), 'critical');
	});
});

void describe('daysLeftToFix', () => {
	void it('should return 0 if we exceed the SLA', () => {
		assert.strictEqual(daysLeftToFix(new Date('2021-01-01'), 'high'), 0);
	});
	void it('should return 30 if a high vuln was raised in the last 24 hours', () => {
		function hoursAgo(hours: number): Date {
			const date = new Date();
			date.setHours(date.getHours() - hours);
			return date;
		}
		assert.strictEqual(daysLeftToFix(hoursAgo(1), 'high'), 30);
		assert.strictEqual(daysLeftToFix(hoursAgo(23), 'high'), 30);
		assert.strictEqual(daysLeftToFix(hoursAgo(25), 'high'), 29);
	});
	void it('should return 2 if a critical vuln was raised today', () => {
		assert.strictEqual(daysLeftToFix(new Date(), 'critical'), 2);
	});

	const monday = new Date('2024-10-07'); // Oct 7th 2024 is a Monday
	beforeEach(() => {
		mock.timers.enable({ apis: ['Date'] , now: monday});
	});

	afterEach(() => {
		mock.timers.reset();
	});

	void it('should add an extra two days to fix vulnerabilities raised on a Friday or Saturday', () => {
		const friday = new Date('2024-10-04'); // Oct 4th 2024 is a Friday
		const saturday = new Date('2024-10-05'); // Oct 5th 2024 is a Saturday
		const isSaturday = saturday.getDay() === 6;
		const isFriday = friday.getDay() === 5;

		assert.strictEqual(isFriday, true);
		assert.strictEqual(daysLeftToFix(friday, 'critical'), 1);

		assert.strictEqual(isSaturday, true);
		assert.strictEqual(daysLeftToFix(saturday, 'critical'), 2);
	});
	void it('should add an extra day to fix vulnerabilities raised on a Sunday', () => {
		const sunday = new Date('2024-10-06'); // Oct 6th 2024 is a Sunday
		const isSunday = sunday.getDay() === 0;

		assert.strictEqual(isSunday, true);
		assert.strictEqual(daysLeftToFix(sunday, 'critical'), 2);
	});
});

const MOCK_TODAY = new Date('2024-01-10');
const MOCK_ONE_DAY_AGO = new Date('2024-01-09');
const MOCK_NEARLY_TWO_DAYS_AGO = new Date('2024-01-08').setMinutes(1);
const MOCK_ONE_WEEK_AGO = new Date('2024-01-03');

void describe('FBSP SLA window', () => {
	beforeEach(() => {
		mock.timers.enable({ apis: ['Date'] , now: MOCK_TODAY});
	});

	afterEach(() => {
		mock.timers.reset();
	});

	void it('Returns true if a critical finding was first observed within a day', () => {
		const firstObservedAt = new Date(MOCK_ONE_DAY_AGO);
		const severity = 'critical';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		assert.strictEqual(isWithinSla, true);
	});

	void it('Returns true if a high finding was first observed within a day', () => {
		const firstObservedAt = new Date(MOCK_ONE_DAY_AGO);
		const severity = 'high';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		assert.strictEqual(isWithinSla, true);
	});

	void it('Returns true if a critical finding was first observed within two days', () => {
		const firstObservedAt = new Date(MOCK_NEARLY_TWO_DAYS_AGO);
		const severity = 'critical';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		assert.strictEqual(isWithinSla, true);
	});

	void it('Returns false if a critical finding is outside the window', () => {
		const firstObservedAt = new Date(MOCK_ONE_WEEK_AGO);
		const severity = 'critical';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		assert.strictEqual(isWithinSla, false);
	});

	void it('Returns false if a low finding was first observed one day ago', () => {
		const firstObservedAt = new Date(MOCK_ONE_DAY_AGO);
		const severity = 'low';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		assert.strictEqual(isWithinSla, false);
	});

	void it('Returns false if a low finding was observed within one day', () => {
		const firstObservedAt = new Date(MOCK_ONE_DAY_AGO);
		const severity = 'low';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		assert.strictEqual(isWithinSla, false);
	});

	void it('Returns false if a critical finding has no information about when it was first observed', () => {
		// This can happen as it's a nullable column in the DB
		const firstObservedAt = null;
		const severity = 'critical';

		const isWithinSla = isWithinSlaTime(firstObservedAt, severity);
		assert.strictEqual(isWithinSla, false);
	});
});

void describe('Failure on empty arrays', () => {
	void it('throw an error if input is an empty array', () => {
		const emptyArray: string[] = [];
		const nonEmptyArray: string[] = ['a', 'b'];
		const typedNonEmptyArray: NonEmptyArray<string> = ['a', 'b'];

		assert.throws(() => toNonEmptyArray(emptyArray));
		assert.doesNotThrow(() => toNonEmptyArray(nonEmptyArray));
		assert.deepStrictEqual(toNonEmptyArray(nonEmptyArray), nonEmptyArray);
		assert.deepStrictEqual(toNonEmptyArray(nonEmptyArray), typedNonEmptyArray);
	});
});
