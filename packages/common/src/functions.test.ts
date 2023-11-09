import { anghammaradThreadKey, branchProtectionCtas } from './functions';

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
