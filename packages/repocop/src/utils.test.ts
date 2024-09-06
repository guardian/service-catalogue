import type { RepocopVulnerability, Repository } from 'common/src/types';
import type { SnykIssue } from './types';
import { isOpenSnykIssue, isProduction, vulnSortPredicate } from './utils';

describe('isProduction', () => {
	test('should return correct values for prod and non-prod repos', () => {
		const prodRepo: Repository = {
			archived: false,
			full_name: 'test',
			id: 1n,
			name: 'test',
			topics: ['production'],
			default_branch: 'main',
			created_at: new Date(),
			pushed_at: new Date(),
			updated_at: new Date(),
		};
		const nonProdRepo: Repository = {
			...prodRepo,
			topics: [],
		};

		expect(isProduction(prodRepo)).toBe(true);
		expect(isProduction(nonProdRepo)).toBe(false);
	});
});

const snykIssue: SnykIssue = {
	id: 'issue1',
	attributes: {
		status: 'open',

		ignored: false,
		problems: [
			{
				id: 'CVE-1234',
				url: 'example.com',
				type: 'vulnerability',
				source: 'NVD',
				updated_at: '',
				disclosed_at: '',
				discovered_at: '',
			},
		],
		created_at: '2020-01-01',
		updated_at: '',
		coordinates: [
			{
				remedies: null,
				is_upgradeable: true,
				is_fixable_snyk: undefined,
				is_patchable: true,
				representations: [
					{
						dependency: {
							package_name: 'fetch',
							package_version: '1.0.0',
						},
					},
				],
			},
		],
		effective_severity_level: 'high',
	},
	relationships: {
		scan_item: {
			data: { id: 'project1', type: 'project' },
		},
		organization: {
			data: { id: '234', type: 'organization' },
		},
	},
};

describe('isOpenSnykIssue', () => {
	test('Should return false if the issue has been ignored', () => {
		const ignoredIssue: SnykIssue = {
			...snykIssue,
			attributes: { ...snykIssue.attributes, ignored: true },
		};
		const result = isOpenSnykIssue(ignoredIssue);
		expect(result).toBe(false);
	});
	test('Should return false if the issue has been resolved', () => {
		const resolvedIssue: SnykIssue = {
			...snykIssue,
			attributes: { ...snykIssue.attributes, status: 'resolved' },
		};
		const result = isOpenSnykIssue(resolvedIssue);
		expect(result).toEqual(false);
	});
	test('Should return false if the issue is both ignored and resolved', () => {
		const resolvedIgnoredIssue: SnykIssue = {
			...snykIssue,
			attributes: {
				...snykIssue.attributes,
				status: 'resolved',
				ignored: true,
			},
		};
		const result = isOpenSnykIssue(resolvedIgnoredIssue);
		expect(result).toBe(false);
	});
	test('Should return true if the issue is open and not ignored', () => {
		const result = isOpenSnykIssue(snykIssue);
		expect(result).toBe(true);
	});
});

describe('vulnSortingPredicate', () => {
	test('should order by severity, and then patchability', () => {
		const criticalPatchable: RepocopVulnerability = {
			package: 'test',
			severity: 'critical',
			full_name: 'test',
			ecosystem: 'test',
			is_patchable: true,
			urls: [],
			open: true,
			source: 'Dependabot',
			alert_issue_date: new Date(),
			cves: [],
		};
		const criticalNotPatchable: RepocopVulnerability = {
			...criticalPatchable,
			is_patchable: false,
		};
		const highPatchable: RepocopVulnerability = {
			...criticalPatchable,
			severity: 'high',
		};
		const highNotPatchable: RepocopVulnerability = {
			...highPatchable,
			is_patchable: false,
		};

		const vulns = [
			highNotPatchable,
			criticalPatchable,
			highPatchable,
			criticalNotPatchable,
		];
		const result = vulns.sort(vulnSortPredicate);

		expect(result).toStrictEqual([
			criticalPatchable,
			criticalNotPatchable,
			highPatchable,
			highNotPatchable,
		]);

		const vulns2 = [highNotPatchable, criticalPatchable, criticalPatchable];
		expect(vulns2.sort(vulnSortPredicate)).toStrictEqual([
			criticalPatchable,
			criticalPatchable,
			highNotPatchable,
		]);
	});
});
