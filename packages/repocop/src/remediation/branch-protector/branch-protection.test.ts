import assert from 'assert';
import { beforeEach, describe, mock, test } from 'node:test';
import type { Mock } from 'node:test';
import type { view_repo_ownership } from '@prisma/client';
import type { Repository } from 'common/types.js';
import type { Octokit } from 'octokit';
import type { Config } from '../../config.js';
import {
	applyBranchProtectionAndMessageTeams,
	createBranchProtectionEvents,
} from './branch-protection.js';

type NotifyFn = (
	fullRepoName: string,
	config: Config,
	teamSlug: string,
) => Promise<void>;

const baseOwner: view_repo_ownership = {
	full_repo_name: '',
	github_team_id: BigInt(0),
	github_team_name: '',
	github_team_slug: '',
	short_repo_name: '',
	role_name: '',
	archived: false,
	galaxies_team: null,
	team_contact_email: null,
};

const baseRepo: Repository = {
	id: BigInt(1),
	full_name: '',
	name: '',
	archived: false,
	topics: [],
	default_branch: 'main',
	created_at: new Date('2024-01-01T00:00:00Z'),
	pushed_at: new Date('2024-01-01T00:00:00Z'),
	updated_at: new Date('2024-01-01T00:00:00Z'),
} as Repository;

const baseEvaluatedRepo = {
	full_name: '',
	topics: true,
	default_branch_name: true,
	branch_protection: false,
	team_based_access: true,
	admin_access: true,
	archiving: null,
	contents: null,
	vulnerability_tracking: true,
	evaluated_on: new Date(),
};

const testConfig: Config = {
	app: 'repocop',
	stage: 'PROD',
	gitHubOrg: 'guardian',
	branchProtectionEnabled: true,
	anghammaradSnSTopic: 'test-topic',
} as unknown as Config;

void describe('Team slugs should be findable for every team associated with a repo', () => {
	void test('A repository that is owned by a team should be included in the list of messages', () => {
		const repo = 'guardian/repo1';

		const teamOneOwner: view_repo_ownership = {
			...baseOwner,
			full_repo_name: repo,
			github_team_slug: 'team-one',
		};

		const actual = createBranchProtectionEvents([repo], [teamOneOwner]);

		assert.deepStrictEqual(actual, [
			{ fullName: repo, teamNameSlugs: ['team-one'] },
		]);
	});

	void test('A repository that has no owner should not be in the list of messages', () => {
		const repo = 'guardian/repo1';
		const actual = createBranchProtectionEvents([repo], []);

		assert.strictEqual(actual.length, 0);
	});

	void test('Multiple repositories with different owners should each get their own event', () => {
		const repo1 = 'guardian/repo1';
		const repo2 = 'guardian/repo2';

		const teamOneOwner: view_repo_ownership = {
			...baseOwner,
			full_repo_name: repo1,
			github_team_slug: 'team-alpha',
		};

		const teamTwoOwner: view_repo_ownership = {
			...baseOwner,
			full_repo_name: repo2,
			github_team_slug: 'team-beta',
		};

		const actual = createBranchProtectionEvents(
			[repo1, repo2],
			[teamOneOwner, teamTwoOwner],
		);

		assert.strictEqual(actual.length, 2);
		assert.deepStrictEqual(actual[0], {
			fullName: repo1,
			teamNameSlugs: ['team-alpha'],
		});
		assert.deepStrictEqual(actual[1], {
			fullName: repo2,
			teamNameSlugs: ['team-beta'],
		});
	});

	void test('A repository with multiple team owners should have all team slugs in one event', () => {
		const repo = 'guardian/multi-owner-repo';

		const teamAlphaOwner: view_repo_ownership = {
			...baseOwner,
			full_repo_name: repo,
			github_team_slug: 'team-alpha',
		};

		const teamBetaOwner: view_repo_ownership = {
			...baseOwner,
			full_repo_name: repo,
			github_team_slug: 'team-beta',
		};

		const actual = createBranchProtectionEvents(
			[repo],
			[teamAlphaOwner, teamBetaOwner],
		);

		assert.strictEqual(actual.length, 1);
		assert.ok(actual[0]);
		assert.strictEqual(actual[0].fullName, repo);
		assert.strictEqual(actual[0].teamNameSlugs.length, 2);
		assert.ok(actual[0].teamNameSlugs.includes('team-alpha'));
		assert.ok(actual[0].teamNameSlugs.includes('team-beta'));
	});

	void test('Empty repository list should return empty events', () => {
		const teamOwner: view_repo_ownership = {
			...baseOwner,
			full_repo_name: 'guardian/some-repo',
			github_team_slug: 'team-one',
		};

		const actual = createBranchProtectionEvents([], [teamOwner]);
		assert.strictEqual(actual.length, 0);
	});
});

void describe('applyBranchProtectionAndMessageTeams', () => {
	let mockGetRepositoryValues: ReturnType<typeof mock.fn>;
	let mockCreateOrUpdateRepositoryValues: ReturnType<typeof mock.fn>;
	let mockOctokit: Octokit;
	let mockNotify: Mock<NotifyFn>;

	beforeEach(() => {
		mockGetRepositoryValues = mock.fn(() =>
			Promise.resolve({
				data: [],
			}),
		);

		mockCreateOrUpdateRepositoryValues = mock.fn(() =>
			Promise.resolve({ data: {} }),
		);

		mockOctokit = {
			rest: {
				repos: {
					customPropertiesForReposGetRepositoryValues: mockGetRepositoryValues,
					customPropertiesForReposCreateOrUpdateRepositoryValues:
						mockCreateOrUpdateRepositoryValues,
				},
			},
		} as unknown as Octokit;

		mockNotify = mock.fn(
			(fullRepoName: string, config: Config, teamSlug: string) => {
				console.log(`Mock notify called for ${fullRepoName} to ${teamSlug}`);
				return Promise.resolve();
			},
		);
	});

	const testReposProduction: Repository[] = [
		{
			...baseRepo,
			full_name: 'guardian/test-repo',
			name: 'test-repo',
			topics: ['production'],
		} as Repository,
	];

	const testEvaluatedReposUnprotected = [
		{
			...baseEvaluatedRepo,
			full_name: 'guardian/test-repo',
		},
	];

	const testRepoOwners: view_repo_ownership[] = [
		{
			...baseOwner,
			full_repo_name: 'guardian/test-repo',
			github_team_slug: 'test-team',
		},
	];

	void test('sets custom property and sends notification for unprotected repo', async () => {
		await applyBranchProtectionAndMessageTeams(
			testEvaluatedReposUnprotected,
			testRepoOwners,
			testConfig,
			testReposProduction,
			mockOctokit,
			mockNotify,
		);

		assert.strictEqual(mockGetRepositoryValues.mock.calls.length, 1);
		assert.strictEqual(mockNotify.mock.calls.length, 1);
	});

	void test('handles empty repo owners gracefully', async () => {
		await applyBranchProtectionAndMessageTeams(
			testEvaluatedReposUnprotected,
			[],
			testConfig,
			testReposProduction,
			mockOctokit,
			mockNotify,
		);

		assert.strictEqual(mockCreateOrUpdateRepositoryValues.mock.calls.length, 1);
		assert.strictEqual(mockNotify.mock.calls.length, 0);
	});

	void test('skips repos when property is already set', async () => {
		mockGetRepositoryValues = mock.fn(() =>
			Promise.resolve({
				data: [
					{
						property_name: 'production_status',
						value: 'production',
					},
				],
			}),
		);

		mockOctokit = {
			rest: {
				repos: {
					customPropertiesForReposGetRepositoryValues: mockGetRepositoryValues,
					customPropertiesForReposCreateOrUpdateRepositoryValues:
						mockCreateOrUpdateRepositoryValues,
				},
			},
		} as unknown as Octokit;

		await applyBranchProtectionAndMessageTeams(
			testEvaluatedReposUnprotected,
			testRepoOwners,
			testConfig,
			testReposProduction,
			mockOctokit,
			mockNotify,
		);

		assert.strictEqual(mockGetRepositoryValues.mock.calls.length, 1);
		assert.strictEqual(mockCreateOrUpdateRepositoryValues.mock.calls.length, 0);
		assert.strictEqual(mockNotify.mock.calls.length, 0);
	});

	void test('handles multiple repos with different teams', async () => {
		const testReposMultiple: Repository[] = [
			{
				...baseRepo,
				full_name: 'guardian/test-repo-1',
				name: 'test-repo-1',
				topics: ['production'],
			},
			{
				...baseRepo,
				id: BigInt(2),
				full_name: 'guardian/test-repo-2',
				name: 'test-repo-2',
				topics: ['production'],
			},
		];

		const evaluatedReposMultiple = [
			{
				...baseEvaluatedRepo,
				full_name: 'guardian/test-repo-1',
			},
			{
				...baseEvaluatedRepo,
				full_name: 'guardian/test-repo-2',
			},
		];

		const repoOwners: view_repo_ownership[] = [
			{
				...baseOwner,
				full_repo_name: 'guardian/test-repo-1',
				github_team_slug: 'team-alpha',
			},
			{
				...baseOwner,
				full_repo_name: 'guardian/test-repo-2',
				github_team_slug: 'team-beta',
			},
		];

		await applyBranchProtectionAndMessageTeams(
			evaluatedReposMultiple,
			repoOwners,
			testConfig,
			testReposMultiple,
			mockOctokit,
			mockNotify,
		);

		assert.strictEqual(mockGetRepositoryValues.mock.calls.length, 2);
		assert.strictEqual(mockCreateOrUpdateRepositoryValues.mock.calls.length, 2);
		assert.strictEqual(mockNotify.mock.calls.length, 2);
	});

	void test('notifies all teams for a repo with multiple owners', async () => {
		const testRepoOwners: view_repo_ownership[] = [
			{
				...baseOwner,
				full_repo_name: 'guardian/test-repo',
				github_team_slug: 'team-alpha',
			},
			{
				...baseOwner,
				full_repo_name: 'guardian/test-repo',
				github_team_slug: 'team-beta',
			},
		];

		await applyBranchProtectionAndMessageTeams(
			testEvaluatedReposUnprotected,
			testRepoOwners,
			testConfig,
			testReposProduction,
			mockOctokit,
			mockNotify,
		);

		assert.strictEqual(mockCreateOrUpdateRepositoryValues.mock.calls.length, 1);
		assert.strictEqual(mockNotify.mock.calls.length, 2);

		const notifiedTeams = mockNotify.mock.calls.map(
			(call) => call.arguments[2],
		);
		assert.ok(notifiedTeams.includes('team-alpha'));
		assert.ok(notifiedTeams.includes('team-beta'));
	});

	void test('sets documentation status for non-production repos', async () => {
		const docRepos: Repository[] = [
			{
				...baseRepo,
				full_name: 'guardian/doc-repo',
				name: 'doc-repo',
				topics: ['documentation'],
			},
		];

		const evaluatedDocRepos = [
			{
				...baseEvaluatedRepo,
				full_name: 'guardian/doc-repo',
			},
		];

		const repoOwners: view_repo_ownership[] = [
			{
				...baseOwner,
				full_repo_name: 'guardian/doc-repo',
				github_team_slug: 'docs-team',
			},
		];

		await applyBranchProtectionAndMessageTeams(
			evaluatedDocRepos,
			repoOwners,
			testConfig,
			docRepos,
			mockOctokit,
			mockNotify,
		);

		const setPropertyCall = mockCreateOrUpdateRepositoryValues.mock.calls[0];
		assert.ok(setPropertyCall);
		const callArg = setPropertyCall.arguments[0] as {
			properties: Array<{ value: string }>;
		};
		assert.ok(callArg);
		assert.ok(callArg.properties[0]);
		assert.strictEqual(callArg.properties[0].value, 'documentation');
	});

	void test('continues processing other repos when one fails', async () => {
		const testReposMultiple: Repository[] = [
			{
				...baseRepo,
				full_name: 'guardian/good-repo',
				name: 'good-repo',
				topics: ['production'],
			},
			{
				...baseRepo,
				id: BigInt(2),
				full_name: 'guardian/bad-repo',
				topics: ['production'],
			},
		];

		const evaluatedReposMultiple = [
			{
				...baseEvaluatedRepo,
				full_name: 'guardian/good-repo',
			},
			{
				...baseEvaluatedRepo,
				full_name: 'guardian/bad-repo',
			},
		];

		let callCount = 0;
		mockGetRepositoryValues = mock.fn(() => {
			callCount++;
			if (callCount === 2) {
				return Promise.reject(new Error('API Error'));
			}
			return Promise.resolve({ data: [] });
		});

		mockOctokit = {
			rest: {
				repos: {
					customPropertiesForReposGetRepositoryValues: mockGetRepositoryValues,
					customPropertiesForReposCreateOrUpdateRepositoryValues:
						mockCreateOrUpdateRepositoryValues,
				},
			},
		} as unknown as Octokit;

		const repoOwners: view_repo_ownership[] = [
			{
				...baseOwner,
				full_repo_name: 'guardian/good-repo',
				github_team_slug: 'team-good',
			},
			{
				...baseOwner,
				full_repo_name: 'guardian/bad-repo',
				github_team_slug: 'team-bad',
			},
		];

		await applyBranchProtectionAndMessageTeams(
			evaluatedReposMultiple,
			repoOwners,
			testConfig,
			testReposMultiple,
			mockOctokit,
			mockNotify,
		);
	});

	void test('does nothing when not in PROD stage', async () => {
		const codeConfig: Config = {
			...testConfig,
			stage: 'CODE',
		} as unknown as Config;

		const repoOwners: view_repo_ownership[] = [
			{
				...baseOwner,
				full_repo_name: 'guardian/test-repo',
				github_team_slug: 'test-team',
			},
		];

		await applyBranchProtectionAndMessageTeams(
			testEvaluatedReposUnprotected,
			repoOwners,
			codeConfig,
			testReposProduction,
			mockOctokit,
			mockNotify,
		);

		assert.strictEqual(mockGetRepositoryValues.mock.calls.length, 0);
		assert.strictEqual(mockCreateOrUpdateRepositoryValues.mock.calls.length, 0);
		assert.strictEqual(mockNotify.mock.calls.length, 0);
	});

	void test('does nothing when branch protection is disabled', async () => {
		const disabledConfig: Config = {
			...testConfig,
			branchProtectionEnabled: false,
		} as unknown as Config;

		const repoOwners: view_repo_ownership[] = [
			{
				...baseOwner,
				full_repo_name: 'guardian/test-repo',
				github_team_slug: 'test-team',
			},
		];

		await applyBranchProtectionAndMessageTeams(
			testEvaluatedReposUnprotected,
			repoOwners,
			disabledConfig,
			testReposProduction,
			mockOctokit,
			mockNotify,
		);

		assert.strictEqual(mockGetRepositoryValues.mock.calls.length, 0);
		assert.strictEqual(mockCreateOrUpdateRepositoryValues.mock.calls.length, 0);
		assert.strictEqual(mockNotify.mock.calls.length, 0);
	});

	void test('calls GitHub API with correct owner and repo', async () => {
		await applyBranchProtectionAndMessageTeams(
			testEvaluatedReposUnprotected,
			testRepoOwners,
			testConfig,
			testReposProduction,
			mockOctokit,
			mockNotify,
		);

		const getCall = mockGetRepositoryValues.mock.calls[0];
		assert.ok(getCall);

		const getCallArg = getCall.arguments[0] as { owner: string; repo: string };
		assert.strictEqual(getCallArg.owner, 'guardian');

		const setCall = mockCreateOrUpdateRepositoryValues.mock.calls[0];
		assert.ok(setCall);

		const setCallArg = setCall.arguments[0] as {
			owner: string;
			repo: string;
			properties: Array<{ property_name: string; value: string }>;
		};
		assert.strictEqual(setCallArg.owner, 'guardian');
		assert.strictEqual(setCallArg.repo, 'test-repo');
		assert.ok(setCallArg.properties[0]);
		assert.strictEqual(
			setCallArg.properties[0].property_name,
			'production_status',
		);
		assert.strictEqual(setCallArg.properties[0].value, 'production');
	});

	void test('calls notify with correct repo and team', async () => {
		await applyBranchProtectionAndMessageTeams(
			testEvaluatedReposUnprotected,
			testRepoOwners,
			testConfig,
			testReposProduction,
			mockOctokit,
			mockNotify,
		);

		// Verify notification parameters
		const notifyCall = mockNotify.mock.calls[0];
		assert.ok(notifyCall);
		assert.strictEqual(notifyCall.arguments[0], 'guardian/test-repo');
		assert.deepStrictEqual(notifyCall.arguments[1], testConfig);
		assert.strictEqual(notifyCall.arguments[2], 'test-team');
	});

	void test('end-to-end flow: unprotected repo gets property set and team notified', async () => {
		const operations: string[] = [];

		mockGetRepositoryValues = mock.fn(
			(params: { owner: string; repo: string }) => {
				operations.push(`GET:${params.owner}/${params.repo}`);
				return Promise.resolve({ data: [] });
			},
		);

		mockCreateOrUpdateRepositoryValues = mock.fn(
			(params: {
				owner: string;
				repo: string;
				properties: Array<{ value: string }>;
			}) => {
				operations.push(
					`SET:${params.owner}/${params.repo}=${params.properties[0]?.value}`,
				);
				return Promise.resolve({ data: {} });
			},
		);
		mockNotify = mock.fn((repo, config, team) => {
			operations.push(`NOTIFY:${repo}:${team}`);
			return Promise.resolve();
		});

		mockOctokit = {
			rest: {
				repos: {
					customPropertiesForReposGetRepositoryValues: mockGetRepositoryValues,
					customPropertiesForReposCreateOrUpdateRepositoryValues:
						mockCreateOrUpdateRepositoryValues,
				},
			},
		} as unknown as Octokit;

		await applyBranchProtectionAndMessageTeams(
			testEvaluatedReposUnprotected,
			testRepoOwners,
			testConfig,
			testReposProduction,
			mockOctokit,
			mockNotify,
		);

		assert.deepStrictEqual(operations, [
			'GET:guardian/test-repo',
			'SET:guardian/test-repo=production',
			'NOTIFY:guardian/test-repo:test-team',
		]);
	});

	void test('skips repos that already have branch protection', async () => {
		const protectedRepos = [
			{
				...baseEvaluatedRepo,
				full_name: 'guardian/test-repo',
				branch_protection: true,
			},
		];

		await applyBranchProtectionAndMessageTeams(
			protectedRepos,
			testRepoOwners,
			testConfig,
			testReposProduction,
			mockOctokit,
			mockNotify,
		);

		assert.strictEqual(mockGetRepositoryValues.mock.calls.length, 0);
		assert.strictEqual(mockCreateOrUpdateRepositoryValues.mock.calls.length, 0);
		assert.strictEqual(mockNotify.mock.calls.length, 0);
	});

	void test('continues when notification fails', async () => {
		mockNotify = mock.fn(() => {
			return Promise.reject(new Error('Notification failed'));
		});

		await applyBranchProtectionAndMessageTeams(
			testEvaluatedReposUnprotected,
			testRepoOwners,
			testConfig,
			testReposProduction,
			mockOctokit,
			mockNotify,
		);

		assert.strictEqual(mockCreateOrUpdateRepositoryValues.mock.calls.length, 1);
		assert.strictEqual(mockNotify.mock.calls.length, 1);
	});
});
