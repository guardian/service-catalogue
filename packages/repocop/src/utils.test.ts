import type { RepocopVulnerability, Repository } from 'common/src/types';
import { describe, expect, test } from 'vitest';
import { isProduction, vulnSortPredicate } from './utils';

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
			within_sla: true,
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
