import assert from 'assert';
import { describe, test } from 'node:test';
import type {
	github_languages,
	github_repository_branches,
	guardian_github_actions_usage,
	view_repo_ownership,
} from '@prisma/client';
import type { RepocopVulnerability, Repository } from 'common/src/types.js';
import { exampleDependabotAlerts } from '../test-data/example-dependabot-alerts.js';
import type { AwsCloudFormationStack } from '../types.js';
import {
	deduplicateVulnerabilitiesByCve,
	dependabotAlertToRepocopVulnerability,
	evaluateOneRepo,
	findStacks,
	hasDependencyTracking,
	hasOldAlerts,
} from './repository.js';

function evaluateRepoTestHelper(
	repo: Repository,
	branches: github_repository_branches[] = [],
	owners: view_repo_ownership[] = [],
	languages: github_languages[] = [],
	dependabotAlerts: RepocopVulnerability[] = [],
	workflowsForRepo: guardian_github_actions_usage[] = [],
) {
	return evaluateOneRepo(
		dependabotAlerts,
		repo,
		branches,
		owners,
		languages,
		workflowsForRepo,
	).repocopRules;
}

const nullBranch: github_repository_branches = {
	cq_sync_time: null,
	cq_source_name: null,
	cq_id: '',
	cq_parent_id: null,
	org: 'guardian',
	repository_id: BigInt(0),
	protection: null,
	name: '',
	commit: null,
	protected: null,
};

const nullWorkflows: guardian_github_actions_usage = {
	evaluated_on: new Date('2024-01-01'),
	full_name: '',
	workflow_path: '',
	workflow_uses: [],
};

const sbtWorkflows: guardian_github_actions_usage = {
	...nullWorkflows,
	full_name: 'guardian/some-repo',
	workflow_path: '.github/workflows/sbt-dependency-graph.yaml',
	workflow_uses: [
		'actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332',
		'scalacenter/sbt-dependency-submission@7ebd561e5280336d3d5b445a59013810ff79325e',
	],
};

export const nullRepo: Repository = {
	full_name: '',
	name: '',
	archived: false,
	id: BigInt(0),
	created_at: new Date(),
	updated_at: null,
	pushed_at: null,
	topics: [],
	default_branch: null,
};

const thePerfectRepo: Repository = {
	...nullRepo,
	full_name: 'repo1',
	name: 'repo1',
	archived: false,
	id: BigInt(1),
	topics: ['production'],
	default_branch: 'main',
};

const nullOwner: view_repo_ownership = {
	github_team_id: 0n,
	github_team_name: '',
	role_name: '',
	full_repo_name: '',
	short_repo_name: '',
	github_team_slug: '',
	archived: false,
	galaxies_team: null,
	team_contact_email: null,
};

void describe('REPOSITORY_01 - default_branch_name should be false when the default branch is not main', () => {
	void test('branch is not main', () => {
		const badRepo = { ...thePerfectRepo, default_branch: 'notMain' };
		const repos: Repository[] = [thePerfectRepo, badRepo];
		const evaluation = repos.map((repo) => evaluateRepoTestHelper(repo));

		assert.deepStrictEqual(
			evaluation.map((repo) => repo.default_branch_name),
			[true, false],
		);
	});
});

void describe('REPOSITORY_02 - Repositories should have branch protection', () => {
	const unprotectedMainBranch: github_repository_branches = {
		...nullBranch,
		repository_id: BigInt(1),
		name: 'main',
		protected: false,
		protection: {},
	};
	const protectedMainBranch: github_repository_branches = {
		...unprotectedMainBranch,
		protected: true,
	};

	void test('We should get an affirmative result when the default branch is protected', () => {
		const unprotectedSideBranch: github_repository_branches = {
			...unprotectedMainBranch,
			name: 'side-branch',
		};

		const actual = evaluateRepoTestHelper(thePerfectRepo, [
			protectedMainBranch,
			unprotectedSideBranch,
		]);

		assert.strictEqual(actual.branch_protection, true);
	});
	void test('We should get a negative result when the default branch of a production repo is not protected', () => {
		const actual = evaluateRepoTestHelper(thePerfectRepo, [
			unprotectedMainBranch,
		]);
		assert.strictEqual(actual.branch_protection, false);
	});
	void test('Repos with no branches do not need protecting, and should be considered protected', () => {
		const repo: Repository = {
			...thePerfectRepo,
			default_branch: null,
		};

		const actual = evaluateRepoTestHelper(repo);
		assert.strictEqual(actual.branch_protection, true);
	});
	void test('Repos with exempted topics should be considered adequately protected, even if they have an unprotected main branch', () => {
		const repo: Repository = {
			...thePerfectRepo,
			topics: ['hackday'],
		};

		const actual = evaluateRepoTestHelper(repo, [unprotectedMainBranch]);
		assert.strictEqual(actual.branch_protection, true);
	});
});

void describe('REPOSITORY_04 - Repository admin access', () => {
	void test('Should return false when there is no admin team', () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
		};

		const teams: view_repo_ownership[] = [
			{
				...nullOwner,
				role_name: 'read-only',
				full_repo_name: 'guardian/service-catalogue',
				github_team_id: 1n,
			},
		];

		const actual = evaluateRepoTestHelper(repo, [], teams);
		assert.strictEqual(actual.admin_access, false);
	});

	void test('Should return true when there is an admin team', () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
		};

		const teams: view_repo_ownership[] = [
			{
				...nullOwner,
				role_name: 'read-only',
				full_repo_name: 'guardian/service-catalogue',
				github_team_id: 1n,
			},
			{
				...nullOwner,
				role_name: 'admin',
				full_repo_name: 'guardian/service-catalogue',
				github_team_id: 2n,
			},
		];

		const actual = evaluateRepoTestHelper(repo, [], teams);
		assert.strictEqual(actual.admin_access, true);
	});

	void test(`Should validate repositories with a 'hackday' topic`, () => {
		//We are not interested in making sure hackday projects are kept up to date
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['hackday'],
		};

		const actual = evaluateRepoTestHelper(repo);
		assert.strictEqual(actual.admin_access, true);
	});

	void test(`Should evaluate repositories with a 'production' topic`, () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			topics: ['production'],
		};

		const teams: view_repo_ownership[] = [
			{
				...nullOwner,
				role_name: 'read-only',
				full_repo_name: 'guardian/service-catalogue',
				github_team_id: 1n,
			},
			{
				...nullOwner,
				role_name: 'admin',
				full_repo_name: 'guardian/service-catalogue',
				github_team_id: 2n,
			},
		];
		const actual = evaluateRepoTestHelper(repo, [], teams);
		assert.strictEqual(actual.admin_access, true);
	});

	void test(`Should return false if all topics are unrecognised`, () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['avocado'],
		};

		const actual = evaluateRepoTestHelper(repo);
		assert.strictEqual(actual.admin_access, false);
	});
});

void describe('REPOSITORY_06 - Repository topics', () => {
	void test('Should return true when there is a single recognised topic', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production'],
		};

		const actual = evaluateRepoTestHelper(repo);
		assert.strictEqual(actual.topics, true);
	});

	void test(`Should validate repos with an interactive topic`, () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['interactive'],
		};

		const actual = evaluateRepoTestHelper(repo);
		assert.strictEqual(actual.topics, true);
	});

	void test('Should return false when there are multiple recognised topics', () => {
		// Having more than one recognised topic creates confusion about how the repo
		// is being used, and could also confuse repocop.
		const repo: Repository = {
			...nullRepo,
			topics: ['production', 'hackday'],
		};

		const actual = evaluateRepoTestHelper(repo);
		assert.strictEqual(actual.topics, false);
	});

	void test('Should return true when there is are multiple topics, not all are recognised', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production', 'android'],
		};

		const actual = evaluateRepoTestHelper(repo);
		assert.strictEqual(actual.topics, true);
	});

	void test('Should return false when there are no topics', () => {
		const repo: Repository = {
			...nullRepo,
			topics: [],
		};

		const actual = evaluateRepoTestHelper(repo);
		assert.strictEqual(actual.topics, false);
	});

	void test('Should return false when there are no recognised topics', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['android', 'mobile'],
		};

		const actual = evaluateRepoTestHelper(repo);
		assert.strictEqual(actual.topics, false);
	});
});

// No rule for this evaluation yet
void describe('NO RULE - Repository maintenance', () => {
	void test('should have happened at some point in the last two years', () => {
		const recentRepo: Repository = {
			...nullRepo,
			created_at: new Date(),
		};

		const oldRepo: Repository = {
			...nullRepo,
			created_at: new Date('2019-01-01'),
		};

		const recentEval = evaluateRepoTestHelper(recentRepo);
		const oldEval = evaluateRepoTestHelper(oldRepo);
		assert.strictEqual(recentEval.archiving, true);
		assert.strictEqual(oldEval.archiving, false);
	});
	void test('should be based only on the most recent date provided', () => {
		const recentlyUpdatedRepo: Repository = {
			...nullRepo,
			updated_at: new Date(),
			//these two dates are more than two years in the past, but should be
			//ignored because the updated_at date is more recent
			created_at: new Date('2019-01-01'),
			pushed_at: new Date('2020-01-01'),
		};

		const actual = evaluateRepoTestHelper(recentlyUpdatedRepo);
		assert.strictEqual(actual.archiving, true);
	});
	void test('is not a concern if no dates are found', () => {
		const recentlyUpdatedRepo: Repository = {
			...nullRepo,
		};

		const actual = evaluateRepoTestHelper(recentlyUpdatedRepo);
		assert.strictEqual(actual.archiving, true);
	});
});

void describe('REPOSITORY_08 - Repositories with related stacks on AWS', () => {
	void test('should be findable if a stack has a matching tag', () => {
		const full_name = 'guardian/repo1';
		const tags = {
			'gu:repo': full_name,
		};
		const repo: Repository = {
			...nullRepo,
			full_name,
			name: 'repo1',
			archived: false,
		};
		const stack: AwsCloudFormationStack = {
			stack_name: 'mystack',
			creation_time: new Date(),
			tags,
		};
		const result = findStacks(repo, [stack]).stacks.length;
		assert.strictEqual(result, 1);
	});
	void test('should be findable if the repo name is part of the stack name', () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/repo1',
			name: 'repo1',
			archived: false,
		};

		const stack: AwsCloudFormationStack = {
			stack_name: 'mystack-repo1-PROD',
			tags: {},
			creation_time: new Date(),
		};
		const result = findStacks(repo, [stack]).stacks.length;
		assert.strictEqual(result, 1);
	});
});

void describe('REPOSITORY_08 - Repositories without any related stacks on AWS', () => {
	void test('should not be findable', () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/someRepo',
			name: 'someRepo',
			archived: false,
		};

		const tags = {
			App: 'myApp',
			Stack: 'myStack',
			Stage: 'CODE',
			'gu:repo': 'guardian/someOtherRepo',
			'gu:build-tool': 'unknown',
		};

		const stack1: AwsCloudFormationStack = {
			stack_name: 'stack1',
			tags: { 'gu:repo': 'guardian/someOtherRepo' },
			creation_time: new Date(),
		};
		const stack2: AwsCloudFormationStack = {
			stack_name: 'stack2',
			tags: {
				...tags,
				Stage: 'PROD',
			},
			creation_time: new Date(),
		};
		const result = findStacks(repo, [stack1, stack2]).stacks.length;
		assert.strictEqual(result, 0);
	});
});

void describe('REPOSITORY_09 - Dependency tracking', () => {
	const emptyLanguages: github_languages = {
		cq_sync_time: null,
		cq_source_name: null,
		cq_id: '',
		cq_parent_id: null,
		full_name: null,
		name: null,
		languages: [],
	};

	const dependabotAndDepGraphSupportedLanguages: github_languages = {
		...emptyLanguages,
		full_name: 'guardian/some-repo',
		name: 'some-repo',
		languages: ['JavaScript', 'Scala'],
	};

	const dependabotSupportedLanguages: github_languages = {
		...emptyLanguages,
		full_name: 'guardian/some-repo',
		name: 'some-repo',
		languages: ['JavaScript'],
	};

	const unsupportedLanguages: github_languages = {
		...emptyLanguages,
		full_name: 'guardian/some-repo',
		name: 'some-repo',
		languages: ['Julia'],
	};

	void test('is valid if all languages are supported by dependabot', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production'],
			full_name: 'guardian/some-repo',
		};
		const actual = hasDependencyTracking(
			repo,
			[dependabotSupportedLanguages],
			[],
		);
		assert.strictEqual(actual, true);
	});
	void test('is not valid if a project uses a language dependabot/dependency graph integrator does not support', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production'],
			full_name: 'guardian/some-repo',
		};
		const actual = hasDependencyTracking(repo, [unsupportedLanguages], []);
		assert.strictEqual(actual, false);
	});
	void test('is not valid if a project uses a language supported by dependency graph integrator but there is no submission workflow for that language', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production'],
			full_name: 'guardian/some-repo',
		};
		const actual = hasDependencyTracking(
			repo,
			[dependabotAndDepGraphSupportedLanguages],
			[nullWorkflows],
		);
		assert.strictEqual(actual, false);
	});
	void test('is valid if a project uses a language supported by dependency graph integrator and has associated submission workflow for that language', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production'],
			full_name: 'guardian/some-repo',
		};
		const actual = hasDependencyTracking(
			repo,
			[dependabotAndDepGraphSupportedLanguages],
			[sbtWorkflows],
		);
		assert.strictEqual(actual, true);
	});
	void test('is valid if a repository has been archived', () => {
		const repo: Repository = {
			...nullRepo,
			archived: true,
			full_name: 'guardian/some-repo',
		};
		const actual = hasDependencyTracking(repo, [unsupportedLanguages], []);
		assert.strictEqual(actual, true);
	});
	void test('is valid if a repository has a non-production tag', () => {
		const repo: Repository = {
			...nullRepo,
			topics: [],
			full_name: 'guardian/some-repo',
		};
		const actual = hasDependencyTracking(repo, [unsupportedLanguages], []);
		assert.strictEqual(actual, true);
	});
	void test('is valid if a repository has no languages', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production'],
			full_name: 'guardian/some-repo',
		};

		const noLanguages: github_languages = {
			...emptyLanguages,
			full_name: 'guardian/some-repo',
			name: 'some-repo',
			languages: [],
		};

		const actual = hasDependencyTracking(repo, [noLanguages], []);
		assert.strictEqual(actual, true);
	});
});

const oldCriticalDependabotVuln: RepocopVulnerability = {
	full_name: 'guardian/some-repo',
	open: true,
	source: 'Dependabot',
	severity: 'critical',
	package: 'ansible',
	urls: [],
	ecosystem: 'pip',
	alert_issue_date: new Date('2021-01-01T00:00:00.000Z'),
	is_patchable: true,
	cves: ['CVE-2021-1234'],
	within_sla: false,
	scope: 'runtime',
	fix_url: null,
};

const newCriticalDependabotVuln: RepocopVulnerability = {
	...oldCriticalDependabotVuln,
	alert_issue_date: new Date(),
};

const oldHighDependabotVuln: RepocopVulnerability = {
	...oldCriticalDependabotVuln,
	severity: 'high',
};

const newHighDependabotVuln: RepocopVulnerability = {
	...oldHighDependabotVuln,
	alert_issue_date: new Date(),
};

void describe('NO RULE - Dependabot alerts', () => {
	void test('should be flagged if there are critical alerts older than two days', () => {
		assert.strictEqual(
			hasOldAlerts([oldCriticalDependabotVuln], thePerfectRepo),
			true,
		);
	});
	void test('should not be flagged if a critical alert was raised today', () => {
		assert.strictEqual(
			hasOldAlerts([newCriticalDependabotVuln], thePerfectRepo),
			false,
		);
	});
	void test('should be flagged if there are high alerts older than 30 days', () => {
		assert.strictEqual(
			hasOldAlerts([oldHighDependabotVuln], thePerfectRepo),
			true,
		);
	});
	void test('should not be flagged if a high alert was raised today', () => {
		assert.strictEqual(
			hasOldAlerts([newHighDependabotVuln], thePerfectRepo),
			false,
		);
	});
	void test('should not be flagged if a high alert was raised 29 days ago', () => {
		const thirteenDaysAgo = new Date();
		thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 29);

		const thirteenDayOldHigh: RepocopVulnerability = {
			...oldHighDependabotVuln,
			alert_issue_date: thirteenDaysAgo,
		};

		assert.strictEqual(
			hasOldAlerts([thirteenDayOldHigh], thePerfectRepo),
			false,
		);
	});
});

void describe('NO RULE - Vulnerabilities from Dependabot', () => {
	const fullName = 'guardian/myrepo';
	const result: RepocopVulnerability[] = exampleDependabotAlerts.map((alert) =>
		dependabotAlertToRepocopVulnerability(fullName, alert, null),
	);

	void test('Should be parseable into a common format', () => {
		const expected1: RepocopVulnerability = {
			full_name: fullName,
			source: 'Dependabot',
			open: false,
			severity: 'high',
			package: 'django',
			urls: [
				'https://github.com/advisories/GHSA-rf4j-j272-fj86',
				'https://nvd.nist.gov/vuln/detail/CVE-2018-6188',
				'https://usn.ubuntu.com/3559-1/',
				'http://www.securitytracker.com/id/1040422',
			],
			ecosystem: 'pip',
			alert_issue_date: new Date('2022-06-15T07:43:03Z'),
			is_patchable: true,
			cves: ['CVE-2018-6188'],
			within_sla: false,
			scope: 'runtime',
			fix_url: null,
		};

		const expected2: RepocopVulnerability = {
			full_name: fullName,
			source: 'Dependabot',
			open: true,
			severity: 'medium',
			package: 'ansible',
			urls: [
				'https://nvd.nist.gov/vuln/detail/CVE-2021-20191',
				'https://access.redhat.com/security/cve/cve-2021-20191',
				'https://bugzilla.redhat.com/show_bug.cgi?id=1916813',
			],
			ecosystem: 'pip',
			alert_issue_date: new Date('2022-06-14T15:21:52Z'),
			is_patchable: true,
			cves: ['CVE-2021-20191'],
			within_sla: false,
			scope: 'runtime',
			fix_url: null,
		};

		assert.deepStrictEqual(result, [expected1, expected2]);
	});
	void test('Should display only the most useful advisory URL', () => {
		const actual = result.map((r) => r.urls)[0];
		const expected = ['https://github.com/advisories/GHSA-rf4j-j272-fj86'];
		assert.deepStrictEqual(actual?.slice(0, 1), expected);
	});
	void test('Should be combined with a PR URL if provided', () => {
		const prUrl = 'https://github.com/guardian/myrepo/pull/123';
		const resultWithPrUrl: RepocopVulnerability =
			dependabotAlertToRepocopVulnerability(
				fullName,
				exampleDependabotAlerts[0]!,
				prUrl,
			);

		assert.strictEqual(resultWithPrUrl.fix_url === prUrl, true);
	});
});

void describe('Deduplication of repocop vulnerabilities', () => {
	const fullName = 'guardian/myrepo';
	const vuln1: RepocopVulnerability = {
		source: 'Dependabot',
		full_name: fullName,
		open: true,
		severity: 'high',
		package: 'django',
		urls: ['https://nvd.nist.gov/vuln/detail/CVE-2018-6188'],
		ecosystem: 'pip',
		alert_issue_date: new Date('2022-06-15T07:43:03Z'),
		is_patchable: true,
		cves: ['CVE-2018-6188'],
		within_sla: false,
		scope: 'runtime',
		fix_url: null,
	};
	const vuln2: RepocopVulnerability = {
		full_name: fullName,
		source: 'Dependabot',
		open: true,
		severity: 'critical',
		package: 'django',
		urls: ['https://nvd.nist.gov/vuln/detail/CVE-2018-6188'],
		ecosystem: 'pip',
		alert_issue_date: new Date('2022-06-15T07:43:03Z'),
		is_patchable: true,
		cves: ['CVE-2018-6188'],
		within_sla: false,
		scope: 'runtime',
		fix_url: null,
	};
	const actual = deduplicateVulnerabilitiesByCve([vuln1, vuln2]);
	void test('Should happen if two vulnerabilities share the same CVEs', () => {
		console.log(actual);
		assert.strictEqual(actual.length, 1);
	});
	void test('Should return the critical vulnerability, given a choice betwen critical and high', () => {
		assert.deepStrictEqual(
			actual.map((x) => x.severity),
			['critical'],
		);
	});
	void test('Should not happen if two vulnerabilities have different CVEs', () => {
		const vuln3: RepocopVulnerability = {
			...vuln1,
			cves: ['CVE-2018-6189'],
		};
		const actual = deduplicateVulnerabilitiesByCve([vuln1, vuln3]);
		assert.strictEqual(actual.length, 2);
	});
	void test('Should not happen if no CVEs are provided', () => {
		const vuln4: RepocopVulnerability = {
			...vuln1,
			cves: [],
		};
		const actual = deduplicateVulnerabilitiesByCve([vuln4, vuln4]);
		assert.strictEqual(actual.length, 2);
	});
});
