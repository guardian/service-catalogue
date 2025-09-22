import assert from 'assert';
import { describe, test } from 'node:test';
import type { RepocopVulnerability, Repository } from 'common/src/types.js';
import { isProduction, vulnSortPredicate } from './utils.js';

void describe('isProduction', () => {
	void test('should return correct values for prod and non-prod repos', () => {
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

		assert.strictEqual(isProduction(prodRepo), true);
		assert.strictEqual(isProduction(nonProdRepo), false);
	});
});

void describe('vulnSortingPredicate', () => {
	void test('should order by severity, and then patchability', () => {
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
			scope: 'runtime',
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

		assert.deepStrictEqual(result, [
			criticalPatchable,
			criticalNotPatchable,
			highPatchable,
			highNotPatchable,
		]);

		const vulns2 = [highNotPatchable, criticalPatchable, criticalPatchable];
		assert.deepStrictEqual(vulns2.sort(vulnSortPredicate), [
			criticalPatchable,
			criticalPatchable,
			highNotPatchable,
		]);
	});
});
