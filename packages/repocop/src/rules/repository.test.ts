import type {
	aws_cloudformation_stacks,
	github_repositories,
	github_repository_branches,
} from '@prisma/client';
import type { RepositoryTeam } from '../query';
import { findStacks, repositoryRuleEvaluation } from './repository';

export const nullRepo: github_repositories = {
	cq_sync_time: null,
	cq_source_name: null,
	cq_id: '',
	cq_parent_id: null,
	org: '',
	id: 0n,
	node_id: null,
	owner: null,
	name: null,
	full_name: null,
	description: null,
	homepage: null,
	code_of_conduct: null,
	default_branch: null,
	master_branch: null,
	created_at: null,
	pushed_at: null,
	updated_at: null,
	html_url: null,
	clone_url: null,
	git_url: null,
	mirror_url: null,
	ssh_url: null,
	svn_url: null,
	language: null,
	fork: null,
	forks_count: null,
	network_count: null,
	open_issues_count: null,
	open_issues: null,
	stargazers_count: null,
	subscribers_count: null,
	watchers_count: null,
	watchers: null,
	size: null,
	auto_init: null,
	parent: null,
	source: null,
	template_repository: null,
	organization: null,
	permissions: null,
	allow_rebase_merge: null,
	allow_update_branch: null,
	allow_squash_merge: null,
	allow_merge_commit: null,
	allow_auto_merge: null,
	allow_forking: null,
	delete_branch_on_merge: null,
	use_squash_pr_title_as_default: null,
	squash_merge_commit_title: null,
	squash_merge_commit_message: null,
	merge_commit_title: null,
	merge_commit_message: null,
	topics: [],
	archived: null,
	disabled: null,
	license: null,
	private: null,
	has_issues: null,
	has_wiki: null,
	has_pages: null,
	has_projects: null,
	has_downloads: null,
	has_discussions: null,
	is_template: null,
	license_template: null,
	gitignore_template: null,
	security_and_analysis: null,
	team_id: null,
	url: null,
	archive_url: null,
	assignees_url: null,
	blobs_url: null,
	branches_url: null,
	collaborators_url: null,
	comments_url: null,
	commits_url: null,
	compare_url: null,
	contents_url: null,
	contributors_url: null,
	deployments_url: null,
	downloads_url: null,
	events_url: null,
	forks_url: null,
	git_commits_url: null,
	git_refs_url: null,
	git_tags_url: null,
	hooks_url: null,
	issue_comment_url: null,
	issue_events_url: null,
	issues_url: null,
	keys_url: null,
	labels_url: null,
	languages_url: null,
	merges_url: null,
	milestones_url: null,
	notifications_url: null,
	pulls_url: null,
	releases_url: null,
	stargazers_url: null,
	statuses_url: null,
	subscribers_url: null,
	subscription_url: null,
	tags_url: null,
	trees_url: null,
	teams_url: null,
	text_matches: null,
	visibility: null,
	role_name: null,
};

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

const nullStack: aws_cloudformation_stacks = {
	cq_sync_time: null,
	cq_source_name: null,
	cq_id: '',
	cq_parent_id: null,
	account_id: null,
	region: null,
	id: null,
	arn: '',
	tags: null,
	creation_time: null,
	stack_name: null,
	stack_status: null,
	capabilities: [],
	change_set_id: null,
	deletion_time: null,
	description: null,
	disable_rollback: null,
	drift_information: null,
	enable_termination_protection: null,
	last_updated_time: null,
	notification_arns: [],
	outputs: null,
	parameters: null,
	parent_id: null,
	retain_except_on_create: null,
	role_arn: null,
	rollback_configuration: null,
	root_id: null,
	stack_id: null,
	stack_status_reason: null,
	timeout_in_minutes: null,
};

const thePerfectRepo: github_repositories = {
	...nullRepo,
	full_name: 'repo1',
	default_branch: 'main',
	topics: ['production'],
	id: BigInt(1),
};

describe('default_branch_name should be false when the default branch is not main', () => {
	test('branch is not main', () => {
		const badRepo = { ...thePerfectRepo, default_branch: 'notMain' };
		const repos: github_repositories[] = [thePerfectRepo, badRepo];
		const evaluation = repos.map((repo) =>
			repositoryRuleEvaluation(repo, [], []),
		);

		expect(evaluation.map((repo) => repo.default_branch_name)).toEqual([
			true,
			false,
		]);
	});
});

describe('Repositories should have branch protection', () => {
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

		const actual = repositoryRuleEvaluation(
			thePerfectRepo,
			[protectedMainBranch, unprotectedSideBranch],
			[],
		);

		expect(actual.branch_protection).toEqual(true);
	});
	test('We should get a negative result when the default branch of a production repo is not protected', () => {
		const actual = repositoryRuleEvaluation(
			thePerfectRepo,
			[unprotectedMainBranch],
			[],
		);
		expect(actual.branch_protection).toEqual(false);
	});
	test('Repos with no branches do not need protecting, and should be considered protected', () => {
		const repo: github_repositories = {
			...thePerfectRepo,
			default_branch: null,
		};

		const actual = repositoryRuleEvaluation(repo, [], []);
		expect(actual.branch_protection).toEqual(true);
	});
	test('Repos with exempted topics should be considered adequately protected, even if they have an unprotected main branch', () => {
		const repo: github_repositories = {
			...thePerfectRepo,
			topics: ['hackday'],
		};

		const actual = repositoryRuleEvaluation(repo, [unprotectedMainBranch], []);
		expect(actual.branch_protection).toEqual(true);
	});
});

describe('Repository admin access', () => {
	test('Should return false when there is no admin team', () => {
		const repo: github_repositories = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
		};

		const teams: RepositoryTeam[] = [
			{
				role_name: 'read-only',
				id: 1234n,
			},
		];

		const actual = repositoryRuleEvaluation(repo, [], teams);
		expect(actual.admin_access).toEqual(false);
	});

	test('Should return true when there is an admin team', () => {
		const repo: github_repositories = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
		};

		const teams: RepositoryTeam[] = [
			{
				role_name: 'read-only',
				id: 1234n,
			},
			{
				role_name: 'admin',
				id: 1234n,
			},
		];

		const actual = repositoryRuleEvaluation(repo, [], teams);
		expect(actual.admin_access).toEqual(true);
	});

	test(`Should validate repositories with a 'hackday' topic`, () => {
		//We are not interested in making sure hackday projects are kept up to date
		const repo: github_repositories = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['hackday'],
		};

		const actual = repositoryRuleEvaluation(repo, [], []);
		expect(actual.admin_access).toEqual(true);
	});

	test(`Should evaluate repositories with a 'production' topic`, () => {
		const repo: github_repositories = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['production'],
		};

		const teams: RepositoryTeam[] = [
			{
				role_name: 'read-only',
				id: 1234n,
			},
			{
				role_name: 'admin',
				id: 1234n,
			},
		];
		const actual = repositoryRuleEvaluation(repo, [], teams);
		expect(actual.admin_access).toEqual(true);
	});

	test(`Should return false if all topics are unrecognised`, () => {
		const repo: github_repositories = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['avocado'],
		};

		const actual = repositoryRuleEvaluation(repo, [], []);
		expect(actual.admin_access).toEqual(false);
	});
});

describe('Repository topics', () => {
	test('Should return true when there is a single recognised topic', () => {
		const repo: github_repositories = {
			...nullRepo,
			topics: ['production'],
		};

		const actual = repositoryRuleEvaluation(repo, [], []);
		expect(actual.topics).toEqual(true);
	});

	test(`Should validate repos with an interactive topic`, () => {
		const repo: github_repositories = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['interactive'],
		};

		const actual = repositoryRuleEvaluation(repo, [], []);
		expect(actual.topics).toEqual(true);
	});

	test('Should return false when there are multiple recognised topics', () => {
		// Having more than one recognised topic creates confusion about how the repo
		// is being used, and could also confuse repocop.
		const repo: github_repositories = {
			...nullRepo,
			topics: ['production', 'hackday'],
		};

		const actual = repositoryRuleEvaluation(repo, [], []);
		expect(actual.topics).toEqual(false);
	});

	test('Should return true when there is are multiple topics, not all are recognised', () => {
		const repo: github_repositories = {
			...nullRepo,
			topics: ['production', 'android'],
		};

		const actual = repositoryRuleEvaluation(repo, [], []);
		expect(actual.topics).toEqual(true);
	});

	test('Should return false when there are no topics', () => {
		const repo: github_repositories = {
			...nullRepo,
			topics: [],
		};

		const actual = repositoryRuleEvaluation(repo, [], []);
		expect(actual.topics).toEqual(false);
	});

	test('Should return false when there are no recognised topics', () => {
		const repo: github_repositories = {
			...nullRepo,
			topics: ['android', 'mobile'],
		};

		const actual = repositoryRuleEvaluation(repo, [], []);
		expect(actual.topics).toEqual(false);
	});
});

describe('Repository maintenance', () => {
	test('should have happened at some point in the last two years', () => {
		const recentRepo: github_repositories = {
			...nullRepo,
			created_at: new Date(),
		};

		const oldRepo: github_repositories = {
			...nullRepo,
			created_at: new Date('2019-01-01'),
		};

		const recentEval = repositoryRuleEvaluation(recentRepo, [], []);
		const oldEval = repositoryRuleEvaluation(oldRepo, [], []);
		expect(recentEval.archiving).toEqual(true);
		expect(oldEval.archiving).toEqual(false);
	});
	test('should be based only on the most recent date provided', () => {
		const recentlyUpdatedRepo: github_repositories = {
			...nullRepo,
			updated_at: new Date(),
			//these two dates are more than two years in the past, but should be
			//ignored because the updated_at date is more recent
			created_at: new Date('2019-01-01'),
			pushed_at: new Date('2020-01-01'),
		};

		const actual = repositoryRuleEvaluation(recentlyUpdatedRepo, [], []);
		expect(actual.archiving).toEqual(true);
	});
	test('is not a concern if no dates are found', () => {
		const recentlyUpdatedRepo: github_repositories = {
			...nullRepo,
		};

		const actual = repositoryRuleEvaluation(recentlyUpdatedRepo, [], []);
		expect(actual.archiving).toEqual(true);
	});
});

describe('Repositories with related stacks on AWS', () => {
	test('should be findable if a stack has a matching tag', () => {
		console.log('THIS IS THE FAILING TEST');
		const full_name = 'guardian/repo1';
		const tags = {
			'gu:repo': full_name,
		};
		const exampleRepo: github_repositories = {
			...thePerfectRepo,
			full_name,
			name: 'repo1',
		};
		const stack: aws_cloudformation_stacks = {
			...nullStack,
			stack_name: 'mystack',
			tags,
		};
		console.log(findStacks(exampleRepo, [stack]));
		const result = findStacks(exampleRepo, [stack])?.stacks.length;
		expect(result).toEqual(1);
	});
	test('should be findable if the repo name is part of the stack name', () => {
		const exampleRepo: github_repositories = {
			...thePerfectRepo,
			full_name: 'guardian/repo1',
			name: 'repo1',
		};
		const stack: aws_cloudformation_stacks = {
			...nullStack,
			stack_name: 'mystack-repo1-PROD',
		};
		const result = findStacks(exampleRepo, [stack])?.stacks.length;
		expect(result).toEqual(1);
	});
});

describe('Repositories without any related stacks on AWS', () => {
	test('should not be findable', () => {
		const exampleRepo: github_repositories = {
			...thePerfectRepo,
			full_name: 'guardian/someRepo',
			name: 'repo1',
		};
		const tags = {
			App: 'myApp',
			Stack: 'myStack',
			Stage: 'CODE',
			'gu:repo': 'guardian/someOtherRepo',
			'gu:build-tool': 'unknown',
		};

		const stack1: aws_cloudformation_stacks = {
			...nullStack,
			tags,
		};
		const stack2: aws_cloudformation_stacks = {
			...nullStack,
			stack_name: 'mystack-someOtherRepo-PROD',
		};
		const result = findStacks(exampleRepo, [stack1, stack2])?.stacks.length;
		expect(result).toEqual(0);
	});
});
