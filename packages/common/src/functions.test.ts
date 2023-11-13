import {
	anghammaradThreadKey,
	branchProtectionCtas,
	getEnvOrThrow,
	parseSecretJson,
} from './functions';

function isValidUrl(str: string) {
	try {
		new URL(str);
		return true;
	} catch (err) {
		return false;
	}
}

describe('branchProtectionCtas', () => {
	it('should return an array of three valid urls', () => {
		const fullRepoName = 'my-org/my-repo';
		const teamSlug = 'my-team';
		const result = branchProtectionCtas(fullRepoName, teamSlug);
		expect(result).toHaveLength(3);
		expect(result.every((x) => isValidUrl(x.url))).toBe(true);
	});

	it('should return the correct urls in the correct order', () => {
		const fullRepoName = 'my-org/my-repo';
		const teamSlug = 'my-team';
		const result = branchProtectionCtas(fullRepoName, teamSlug);
		expect(result.map((x) => x.url)).toStrictEqual([
			'https://github.com/my-org/my-repo',
			'https://metrics.gutools.co.uk/d/EOPnljWIz/repocop-compliance?var-team=my-team&var-rule=All&orgId=1',
			'https://github.com/my-org/my-repo/settings/branches',
		]);
	});
});

describe('anghammaradThreadKey', () => {
	it('should return a the expected string, with no slashes', () => {
		const fullRepoName = 'my-org/my-repo';
		const result = anghammaradThreadKey(fullRepoName);
		expect(result).toBe('service-catalogue-my-org-my-repo');
	});
});

describe('parseSecretJson', () => {
	it('should parse a valid JSON string', () => {
		const secretString =
			'{"installationId":"installation1","clientSecret":"secret1","appId":"app1","base64PrivateKey":"aGVsbG8K"}';
		const result = parseSecretJson(secretString);
		expect(result.installationId).toBe('installation1');
		expect(result.strategyOptions.clientSecret).toBe('secret1');
		expect(result.strategyOptions.appId).toBe('app1');
		expect(result.strategyOptions.privateKey).toBe('hello\n');
	});

	it('should throw an error for an invalid JSON string', () => {
		const secretString = 'not a JSON string';
		expect(() => parseSecretJson(secretString)).toThrow();
	});
});

describe('getEnvOrThrow', () => {
	it('should return the value of an existing environment variable', () => {
		process.env.TEST_VAR = 'test value';
		expect(getEnvOrThrow('TEST_VAR')).toBe('test value');
	});

	it('should throw an error for a non-existing environment variable', () => {
		expect(() => getEnvOrThrow('NON_EXISTING_VAR')).toThrow();
	});
});
