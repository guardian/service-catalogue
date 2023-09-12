import type {
	github_repositories,
	github_repository_branches,
} from '@prisma/client';
import type { RepositoryTeams } from '../query';
import { repository01, repository02, repository04 } from './repository';

const nullRepo: github_repositories = {
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

const thePerfectRepo: github_repositories = {
	...nullRepo,
	full_name: 'repo1',
	default_branch: 'main',
	topics: ['production'],
	id: BigInt(1),
};

describe('repository_01 should be false when the default branch is not main', () => {
	test('branch is not main', () => {
		const badRepo = { ...thePerfectRepo, default_branch: 'notMain' };
		const repos: github_repositories[] = [thePerfectRepo, badRepo];
		expect(repos.map(repository01)).toEqual([true, false]);
	});
});

describe('Repositories should have branch protection', () => {
	test('We should get an affirmative result when the default branch is protected', () => {
		const protectedMainBranch: github_repository_branches = {
			...nullBranch,
			repository_id: BigInt(1),
			name: 'main',
			protected: true,
		};
		const unprotectedSideBranch: github_repository_branches = {
			...protectedMainBranch,
			name: 'side-branch',
			protected: false,
		};

		const result = repository02(thePerfectRepo, [
			protectedMainBranch,
			unprotectedSideBranch,
		]);
		expect(result).toEqual(true);
	});
	test('We should get a negative result when the default branch is not protected', () => {
		const repo: github_repositories = {
			...nullRepo,
			full_name: 'repo1',
			default_branch: 'default',
			id: BigInt(1),
		};

		const unprotectedMainBranch: github_repository_branches = {
			...nullBranch,
			repository_id: BigInt(1),
			name: 'default',
			protected: false,
			protection: {},
		};
		expect(repository02(repo, [unprotectedMainBranch])).toEqual(false);
	});
});

describe('Repository admin access', () => {
	test('Should return false when there is no admin team', () => {
		const repo: github_repositories = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
		};

		const teams: RepositoryTeams[] = [
			{
				role_name: 'read-only',
				id: 1234n,
			},
		];

		expect(repository04(repo, teams)).toEqual(false);
	});

	test('Should return true when there is an admin team', () => {
		const repo: github_repositories = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
		};

		const teams: RepositoryTeams[] = [
			{
				role_name: 'read-only',
				id: 1234n,
			},
			{
				role_name: 'admin',
				id: 1234n,
			},
		];

		expect(repository04(repo, teams)).toEqual(true);
	});

	test(`Should not evaluate repository's with a 'hackday' topic`, () => {
		const repo: github_repositories = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['hackday'],
		};

		const teams: RepositoryTeams[] = [
			{
				role_name: 'read-only',
				id: 1234n,
			},
			{
				role_name: 'admin',
				id: 1234n,
			},
		];

		expect(repository04(repo, teams)).toEqual(false);
	});

	test(`Should evaluate repository's with a 'production' topic`, () => {
		const repo: github_repositories = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['production'],
		};

		const teams: RepositoryTeams[] = [
			{
				role_name: 'read-only',
				id: 1234n,
			},
			{
				role_name: 'admin',
				id: 1234n,
			},
		];

		expect(repository04(repo, teams)).toEqual(true);
	});
});
