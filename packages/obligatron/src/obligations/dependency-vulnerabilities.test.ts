import type { Repository } from 'common/types';
import { describe, expect, it } from 'vitest';
import type { ObligatronRepocopVulnerability } from './dependency-vulnerabilities';
import { evaluateObligationForOneRepo } from './dependency-vulnerabilities';

describe('The dependency vulnerabilities obligation', () => {
	const someDate = new Date('2020-01-01');

	const myRepo: Repository = {
		archived: false,
		id: BigInt(1),
		default_branch: 'main',
		full_name: 'some/repo',
		name: 'repo',
		topics: ['production'],
		created_at: someDate,
		pushed_at: someDate,
		updated_at: someDate,
	};

	const myVuln: ObligatronRepocopVulnerability = {
		package: 'some-package',
		full_name: 'some/repo',
		severity: 'high',
		open: true,
		urls: [''],
		ecosystem: 'npm',
		alert_issue_date: someDate,
		is_patchable: true,
		cves: [''],
		repo_owner: 'owner1',
		source: 'Dependabot',
		within_sla: false,
	};

	it('should return something if it finds a vulnerability on a repo', () => {
		const actual = evaluateObligationForOneRepo([myVuln], myRepo);
		console.log(actual);

		const expected = {
			resource: 'some/repo',
			reason: 'Repository has 1 vulnerable packages, some-package',
			url: 'https://metrics.gutools.co.uk/d/fdib3p8l85jwgd/?var-repo_owner=owner1',
			contacts: { slugs: ['owner1'] },
		};

		expect(actual).toEqual(expected);
	});
	it('should return undefined if it finds no vulnerabilities on a repo', () => {
		const actual = evaluateObligationForOneRepo([], myRepo);
		expect(actual).toBeUndefined();
	});
	it('should return undefined if it finds only vulnerabilities related to other repos', () => {
		const actual = evaluateObligationForOneRepo([myVuln], {
			...myRepo,
			full_name: 'other/repo',
		});
		expect(actual).toBeUndefined();
	});
});
