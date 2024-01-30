import type {
	github_languages,
	github_repository_branches,
	github_workflows,
	snyk_projects,
	snyk_reporting_latest_issues,
} from '@prisma/client';
import type {
	AwsCloudFormationStack,
	PartialAlert,
	Repository,
	SnykProject,
	TeamRepository,
} from '../types';
import {
	evaluateOneRepo,
	findStacks,
	hasDependencyTracking,
	hasOldDependabotAlerts,
	hasOldSnykAlerts,
	parseSnykTags,
} from './repository';

function evaluateRepoTestHelper(
	repo: Repository,
	branches: github_repository_branches[] = [],
	teams: TeamRepository[] = [],
	languages: github_languages[] = [],
	snykProjects: snyk_projects[] = [],
	githubWorkflows: github_workflows[] = [],
	alerts: PartialAlert[] = [],
) {
	return evaluateOneRepo(
		alerts,
		repo,
		branches,
		teams,
		languages,
		snykProjects,
		githubWorkflows,
	);
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

describe('REPOSITORY_01 - default_branch_name should be false when the default branch is not main', () => {
	test('branch is not main', () => {
		const badRepo = { ...thePerfectRepo, default_branch: 'notMain' };
		const repos: Repository[] = [thePerfectRepo, badRepo];
		const evaluation = repos.map((repo) => evaluateRepoTestHelper(repo));

		expect(evaluation.map((repo) => repo.default_branch_name)).toEqual([
			true,
			false,
		]);
	});
});

describe('REPOSITORY_02 - Repositories should have branch protection', () => {
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

	test('We should get an affirmative result when the default branch is protected', () => {
		const unprotectedSideBranch: github_repository_branches = {
			...unprotectedMainBranch,
			name: 'side-branch',
		};

		const actual = evaluateRepoTestHelper(thePerfectRepo, [
			protectedMainBranch,
			unprotectedSideBranch,
		]);

		expect(actual.branch_protection).toEqual(true);
	});
	test('We should get a negative result when the default branch of a production repo is not protected', () => {
		const actual = evaluateRepoTestHelper(thePerfectRepo, [
			unprotectedMainBranch,
		]);
		expect(actual.branch_protection).toEqual(false);
	});
	test('Repos with no branches do not need protecting, and should be considered protected', () => {
		const repo: Repository = {
			...thePerfectRepo,
			default_branch: null,
		};

		const actual = evaluateRepoTestHelper(repo);
		expect(actual.branch_protection).toEqual(true);
	});
	test('Repos with exempted topics should be considered adequately protected, even if they have an unprotected main branch', () => {
		const repo: Repository = {
			...thePerfectRepo,
			topics: ['hackday'],
		};

		const actual = evaluateRepoTestHelper(repo, [unprotectedMainBranch]);
		expect(actual.branch_protection).toEqual(true);
	});
});

describe('REPOSITORY_04 - Repository admin access', () => {
	test('Should return false when there is no admin team', () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
		};

		const teams: TeamRepository[] = [
			{
				role_name: 'read-only',
				id: 1234n,
				team_id: 1n,
			},
		];

		const actual = evaluateRepoTestHelper(repo, [], teams);
		expect(actual.admin_access).toEqual(false);
	});

	test('Should return true when there is an admin team', () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
		};

		const teams: TeamRepository[] = [
			{
				role_name: 'read-only',
				id: 1234n,
				team_id: 1n,
			},
			{
				role_name: 'admin',
				id: 1234n,
				team_id: 2n,
			},
		];

		const actual = evaluateRepoTestHelper(repo, [], teams);
		expect(actual.admin_access).toEqual(true);
	});

	test(`Should validate repositories with a 'hackday' topic`, () => {
		//We are not interested in making sure hackday projects are kept up to date
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['hackday'],
		};

		const actual = evaluateRepoTestHelper(repo);
		expect(actual.admin_access).toEqual(true);
	});

	test(`Should evaluate repositories with a 'production' topic`, () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['production'],
		};

		const teams: TeamRepository[] = [
			{
				role_name: 'read-only',
				id: 1234n,
				team_id: 1n,
			},
			{
				role_name: 'admin',
				id: 1234n,
				team_id: 2n,
			},
		];
		const actual = evaluateRepoTestHelper(repo, [], teams);
		expect(actual.admin_access).toEqual(true);
	});

	test(`Should return false if all topics are unrecognised`, () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['avocado'],
		};

		const actual = evaluateRepoTestHelper(repo);
		expect(actual.admin_access).toEqual(false);
	});
});

describe('REPOSITORY_06 - Repository topics', () => {
	test('Should return true when there is a single recognised topic', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production'],
		};

		const actual = evaluateRepoTestHelper(repo);
		expect(actual.topics).toEqual(true);
	});

	test(`Should validate repos with an interactive topic`, () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['interactive'],
		};

		const actual = evaluateRepoTestHelper(repo);
		expect(actual.topics).toEqual(true);
	});

	test('Should return false when there are multiple recognised topics', () => {
		// Having more than one recognised topic creates confusion about how the repo
		// is being used, and could also confuse repocop.
		const repo: Repository = {
			...nullRepo,
			topics: ['production', 'hackday'],
		};

		const actual = evaluateRepoTestHelper(repo);
		expect(actual.topics).toEqual(false);
	});

	test('Should return true when there is are multiple topics, not all are recognised', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production', 'android'],
		};

		const actual = evaluateRepoTestHelper(repo);
		expect(actual.topics).toEqual(true);
	});

	test('Should return false when there are no topics', () => {
		const repo: Repository = {
			...nullRepo,
			topics: [],
		};

		const actual = evaluateRepoTestHelper(repo);
		expect(actual.topics).toEqual(false);
	});

	test('Should return false when there are no recognised topics', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['android', 'mobile'],
		};

		const actual = evaluateRepoTestHelper(repo);
		expect(actual.topics).toEqual(false);
	});
});

// No rule for this evaluation yet
describe('NO RULE - Repository maintenance', () => {
	test('should have happened at some point in the last two years', () => {
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
		expect(recentEval.archiving).toEqual(true);
		expect(oldEval.archiving).toEqual(false);
	});
	test('should be based only on the most recent date provided', () => {
		const recentlyUpdatedRepo: Repository = {
			...nullRepo,
			updated_at: new Date(),
			//these two dates are more than two years in the past, but should be
			//ignored because the updated_at date is more recent
			created_at: new Date('2019-01-01'),
			pushed_at: new Date('2020-01-01'),
		};

		const actual = evaluateRepoTestHelper(recentlyUpdatedRepo);
		expect(actual.archiving).toEqual(true);
	});
	test('is not a concern if no dates are found', () => {
		const recentlyUpdatedRepo: Repository = {
			...nullRepo,
		};

		const actual = evaluateRepoTestHelper(recentlyUpdatedRepo);
		expect(actual.archiving).toEqual(true);
	});
});

describe('REPOSITORY_08 - Repositories with related stacks on AWS', () => {
	test('should be findable if a stack has a matching tag', () => {
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
		expect(result).toEqual(1);
	});
	test('should be findable if the repo name is part of the stack name', () => {
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
		expect(result).toEqual(1);
	});
});

describe('REPOSITORY_08 - Repositories without any related stacks on AWS', () => {
	test('should not be findable', () => {
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
		expect(result).toEqual(0);
	});
});

describe('REPOSITORY_09 - Snyk tags', () => {
	const nullSnykProject: snyk_projects = {
		cq_source_name: null,
		cq_sync_time: null,
		cq_id: '',
		cq_parent_id: null,
		id: '',
		name: null,
		origin: null,
		issue_counts_by_severity: null,
		tags: null,
		org_id: null,
	};

	test('should be retrievable if they are commit, repo, or branch', () => {
		const project: snyk_projects = {
			...nullSnykProject,
			tags: [
				{ key: 'commit', value: '1234' },
				{ key: 'repo', value: 'guardian/some-repo' },
				{ key: 'branch', value: 'main' },
			],
		};
		const tags = parseSnykTags(project);
		expect(tags.commit).toEqual('1234');
		expect(tags.repo).toEqual('guardian/some-repo');
		expect(tags.branch).toEqual('main');
	});
	test('should not be defined if they do not exist', () => {
		const project: snyk_projects = {
			...nullSnykProject,
			tags: [{ key: 'commit', value: '1234' }],
		};
		const tags = parseSnykTags(project);
		expect(tags.commit).toEqual('1234');
		expect(tags.repo).toBeUndefined();
		expect(tags.branch).toBeUndefined();
	});
});

describe('REPOSITORY_09 - Dependency tracking', () => {
	const nullSnykProject: snyk_projects = {
		cq_source_name: null,
		cq_sync_time: null,
		cq_id: '',
		cq_parent_id: null,
		id: '',
		name: null,
		origin: null,
		issue_counts_by_severity: null,
		tags: null,
		org_id: null,
	};

	const emptyLanguages: github_languages = {
		cq_sync_time: null,
		cq_source_name: null,
		cq_id: '',
		cq_parent_id: null,
		full_name: null,
		name: null,
		languages: [],
	};

	const snykSupportedLanguages: github_languages = {
		...emptyLanguages,
		full_name: 'guardian/some-repo',
		name: 'some-repo',
		languages: ['JavaScript', 'Scala'],
	};

	const fullySupportedLanguages: github_languages = {
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

	test('is valid if all languages are supported, and the repo is on snyk', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production'],
			full_name: 'guardian/some-repo',
			default_branch: 'main',
		};
		const project: snyk_projects = {
			...nullSnykProject,
			tags: [
				{ key: 'repo', value: 'guardian/some-repo' },
				{ key: 'branch', value: 'main' },
			],
		};

		const actual = hasDependencyTracking(
			repo,
			[snykSupportedLanguages],
			[project],
			[],
		);
		expect(actual).toEqual(true);
	});
	test('is valid if all languages are supported by dependabot, even if the repo is not on snyk', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production'],
			full_name: 'guardian/some-repo',
		};
		const actual = hasDependencyTracking(
			repo,
			[fullySupportedLanguages],
			[],
			[],
		);
		expect(actual).toEqual(true);
	});
	test('is not valid if a project is not on snyk, and uses a language dependabot does not support', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production'],
			full_name: 'guardian/some-repo',
		};
		const actual = hasDependencyTracking(
			repo,
			[snykSupportedLanguages],
			[],
			[],
		);
		expect(actual).toEqual(false);
	});
	test('is not valids not valid if a project is on snyk, and uses a language not supported by snyk', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production'],
			full_name: 'guardian/some-repo',
		};
		const actual = hasDependencyTracking(repo, [unsupportedLanguages], [], []);
		expect(actual).toEqual(false);
	});
	test('is valid if a repository has been archived', () => {
		const repo: Repository = {
			...nullRepo,
			archived: true,
			full_name: 'guardian/some-repo',
		};
		const actual = hasDependencyTracking(repo, [unsupportedLanguages], [], []);
		expect(actual).toEqual(true);
	});
	test('is valid if a repository has a non-production tag', () => {
		const repo: Repository = {
			...nullRepo,
			topics: [],
			full_name: 'guardian/some-repo',
		};
		const actual = hasDependencyTracking(repo, [unsupportedLanguages], [], []);
		expect(actual).toEqual(true);
	});
	test('is valid if a repository has no languages', () => {
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

		const actual = hasDependencyTracking(repo, [noLanguages], [], []);
		expect(actual).toEqual(true);
	});
	const workflow: github_workflows = {
		cq_sync_time: null,
		cq_source_name: null,
		cq_id: '',
		cq_parent_id: null,
		id: 1n,
		name: null,
		path: '.github/workflows/snyk.yml',
		repository_id: 1n,
		org: 'guardian',
		contents: null,
		node_id: null,
		state: null,
		created_at: null,
		updated_at: null,
		url: null,
		html_url: null,
		badge_url: null,
	};
	test('is valid if a repository has a snyk.yml', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production'],
			full_name: 'guardian/some-repo',
			id: 1n,
		};

		const actual = hasDependencyTracking(
			repo,
			[snykSupportedLanguages],
			[],
			[workflow],
		);
		expect(actual).toEqual(true);
	});
	test('is not valid if a repository does not have a snyk.yml', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production'],
			full_name: 'guardian/some-repo',
			id: 1n,
		};
		const nonMatchingWorkflow: github_workflows = {
			...workflow,
			path: '.github/workflows/other.yml',
		};

		const actual = hasDependencyTracking(
			repo,
			[unsupportedLanguages],
			[],
			[nonMatchingWorkflow],
		);
		expect(actual).toEqual(false);
	});
});

function createAlert(
	severity: 'critical' | 'high' | 'medium',
	createdAt: Date,
	state: 'open' | 'auto_dismissed' | 'dismissed' | 'fixed',
): PartialAlert {
	const alert = {
		state,
		created_at: createdAt.toISOString(),
		security_vulnerability: {
			severity,
			vulnerable_version_range: '',
			first_patched_version: {
				identifier: '',
			},
			package: {
				name: '',
				ecosystem: '',
			},
		},
		dependency: {
			package: {
				name: '',
				ecosystem: '',
			},
		},
	};
	return alert;
}

describe('NO RULE - Repository alerts', () => {
	test('should be flagged if there are critical alerts older than one day', () => {
		console.log(new Date('2021-01-01').toISOString());
		const alerts: PartialAlert[] = [
			createAlert('critical', new Date('2021-01-01'), 'open'),
		];

		expect(hasOldDependabotAlerts(alerts, 'test')).toBe(true);
	});
	test('should not be flagged if a critical alert was raised today', () => {
		const alerts: PartialAlert[] = [
			createAlert('critical', new Date(), 'open'),
		];

		expect(hasOldDependabotAlerts(alerts, 'test')).toBe(false);
	});
	test('should be flagged if there are high alerts older than 14 days', () => {
		const alerts: PartialAlert[] = [
			createAlert('high', new Date('2021-01-01'), 'open'),
		];

		expect(hasOldDependabotAlerts(alerts, 'test')).toBe(true);
	});
	test('should not be flagged if a high alert was raised today', () => {
		const alerts: PartialAlert[] = [createAlert('high', new Date(), 'open')];

		expect(hasOldDependabotAlerts(alerts, 'test')).toBe(false);
	});
	test('should not be flagged if a high alert was raised 13 days ago', () => {
		const thirteenDaysAgo = new Date();
		thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13);
		const alerts: PartialAlert[] = [
			createAlert('high', thirteenDaysAgo, 'open'),
		];

		expect(hasOldDependabotAlerts(alerts, 'test')).toBe(false);
	});
});

describe('NO RULE - Old snyk issues', () => {
	const repoName = thePerfectRepo.full_name;
	const snykProjectId = '1a2b';
	const myIssue = {
		id: '',
		CVSSv3: '',
		Semver: { unaffected: '', vulnerable: ['<2.814.0'] },
		Patches: [],
		ignored: null,
		package: '',
		version: '',
		severity: 'high',
		cvssScore: 7.3,
		isIgnored: false,
		isPatched: false,
		isPinnable: false,
		isPatchable: false,
		isUpgradable: true,
		priorityScore: 999,
		disclosureTime: '2023-01-14T00:00:00.000Z',
		publicationTime: '2023-01-14T12:00:00.000Z',
	};

	const myProject = {
		id: snykProjectId,
		url: '',
		name: '',
		source: 'cli',
		targetFile: '',
		packageManager: '',
	};

	const myIssueTableRow: snyk_reporting_latest_issues = {
		cq_sync_time: null,
		cq_source_name: null,
		cq_id: '',
		cq_parent_id: null,
		id: '',
		issue: myIssue,
		projects: [myProject],
		organization_id: '',
		introduced_date: null,
		project: null,
		is_fixed: null,
		patched_date: null,
		fixed_date: null,
	};

	const proj: SnykProject = {
		id: snykProjectId,
		attributes: {
			name: '',
			origin: '',
			status: '',
			tags: [
				{
					key: 'repo',
					value: repoName,
				},
			],
		},
	};

	test('Should not be detected if no projects or issues are passed', () => {
		const x = hasOldSnykAlerts(thePerfectRepo, [], []);
		expect(x).toEqual([]);
	});
	test('Should be detected if a repo, project, and issue match', () => {
		const x = hasOldSnykAlerts(thePerfectRepo, [myIssueTableRow], [proj]);
		expect(x.length).toEqual(1);
	});
	test('Should not detected if a snyk project has no tags', () => {
		const x = hasOldSnykAlerts(
			thePerfectRepo,
			[myIssueTableRow],
			[{ ...proj, attributes: { ...proj.attributes, tags: [] } }],
		);
		expect(x.length).toEqual(0);
	});
});
