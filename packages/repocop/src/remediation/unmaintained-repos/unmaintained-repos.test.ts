import assert from 'assert';
import { describe, it, mock } from 'node:test';
import type { view_repo_ownership } from 'common/prisma-client/client.js';
import type { Octokit } from 'octokit';
import type { Config } from '../../config.js';
import type { EvaluationResult } from '../../types.js';
import { findOwnersForAllUnmaintainedRepos } from './unmaintained-repos.js';

const config = { gitHubOrg: 'guardian' } as Config;

function evaluationResult(name: string, archiving = false): EvaluationResult {
	const fullName = `guardian/${name}`;
	return {
		fullName,
		repocopRules: { full_name: fullName, archiving },
		vulnerabilities: [],
	} as unknown as EvaluationResult;
}

function ownership(name: string, teamSlug: string): view_repo_ownership {
	return {
		full_repo_name: `guardian/${name}`,
		github_team_slug: teamSlug,
		role_name: 'admin',
	} as view_repo_ownership;
}

function commit(email?: string, username?: string) {
	return {
		commit: { author: { name: 'Some Name', email } },
		author: username ? { login: username } : null,
	};
}

type CommitsByRepo = Record<string, unknown[] | Error>;

function mockOctokit(commitsByRepo: CommitsByRepo) {
	const listCommits = mock.fn((params: { owner: string; repo: string }) => {
		const commits = commitsByRepo[params.repo] ?? [];
		return commits instanceof Error
			? Promise.reject(commits)
			: Promise.resolve({ data: commits });
	});
	const octokit = { rest: { repos: { listCommits } } } as unknown as Octokit;
	return { octokit, listCommits };
}

/** Repo names are short names; "guardian/" is added for you. */
async function run(args: {
	repos: Array<string | { name: string; archiving: boolean }>;
	owners?: view_repo_ownership[];
	commits?: CommitsByRepo;
}) {
	const { octokit, listCommits } = mockOctokit(args.commits ?? {});
	const evaluationResults = args.repos.map((r) =>
		typeof r === 'string'
			? evaluationResult(r)
			: evaluationResult(r.name, r.archiving),
	);
	const result = await findOwnersForAllUnmaintainedRepos(
		evaluationResults,
		args.owners ?? [],
		config,
		octokit,
	);
	return { result, listCommits };
}

void describe('findOwnersForAllUnmaintainedRepos', () => {
	void it('returns admin teams for team-owned repos without calling GitHub', async () => {
		const { result, listCommits } = await run({
			repos: ['team-repo'],
			owners: [
				ownership('team-repo', 'team-a'),
				ownership('team-repo', 'team-b'),
			],
		});

		assert.deepStrictEqual(result, [
			{
				repo: 'guardian/team-repo',
				owners: ['team-a', 'team-b'],
				format: 'Team',
			},
		]);
		assert.strictEqual(listCommits.mock.callCount(), 0);
	});

	void it('falls back to recent Guardian committers when there is no team owner', async () => {
		const { result, listCommits } = await run({
			repos: ['committer-repo'],
			commits: {
				'committer-repo': [
					commit('a@guardian.co.uk', 'a'),
					commit('b@theguardian.com', 'b'),
				],
			},
		});

		assert.deepStrictEqual(result, [
			{
				repo: 'guardian/committer-repo',
				owners: ['a@guardian.co.uk', 'b@theguardian.com'],
				format: 'Email',
			},
		]);
		assert.strictEqual(listCommits.mock.callCount(), 1);
	});

	void it('deduplicates committers and ignores non-Guardian or incomplete authors', async () => {
		const { result } = await run({
			repos: ['committer-repo'],
			commits: {
				'committer-repo': [
					commit('a@guardian.co.uk', 'a'),
					commit('a@guardian.co.uk', 'a'),
					commit('external@example.com', 'external'),
					commit(undefined, 'no-email'),
					commit('no-username@guardian.co.uk', undefined),
				],
			},
		});

		assert.deepStrictEqual(result, [
			{
				repo: 'guardian/committer-repo',
				owners: ['a@guardian.co.uk'],
				format: 'Email',
			},
		]);
	});

	const reposWithNoOwners: Array<[string, CommitsByRepo[string]]> = [
		['an empty repo with no commits', []],
		['a repo whose commit lookup fails', new Error('Git Repository is empty.')],
		[
			'a repo with only non-Guardian committers',
			[commit('a@example.com', 'a')],
		],
	];

	for (const [description, commits] of reposWithNoOwners) {
		void it(`omits ${description}`, async () => {
			const { result } = await run({
				repos: ['no-owner-repo'],
				commits: { 'no-owner-repo': commits },
			});

			assert.deepStrictEqual(result, []);
		});
	}

	void it('excludes maintained repos from the results', async () => {
		const { result, listCommits } = await run({
			repos: [{ name: 'maintained-repo', archiving: true }],
			owners: [ownership('maintained-repo', 'team-a')],
			commits: { 'maintained-repo': [commit('a@guardian.co.uk', 'a')] },
		});

		assert.deepStrictEqual(result, []);
		assert.strictEqual(listCommits.mock.callCount(), 0);
	});

	void it('handles a mixed batch and skips maintained repos', async () => {
		const { result, listCommits } = await run({
			repos: [
				'team-repo',
				'committer-repo',
				'empty-repo',
				'ownerless-repo',
				{ name: 'maintained-repo', archiving: true },
			],
			owners: [
				ownership('team-repo', 'team-a'),
				ownership('maintained-repo', 'team-z'),
				ownership('other-repo', 'team-other'),
			],
			commits: {
				'committer-repo': [commit('a@guardian.co.uk', 'a')],
				'empty-repo': [],
				'ownerless-repo': [commit('x@example.com', 'x')],
				'maintained-repo': [commit('z@guardian.co.uk', 'z')],
			},
		});

		assert.deepStrictEqual(result, [
			{ repo: 'guardian/team-repo', owners: ['team-a'], format: 'Team' },
			{
				repo: 'guardian/committer-repo',
				owners: ['a@guardian.co.uk'],
				format: 'Email',
			},
		]);
		const queriedRepos = listCommits.mock.calls.map((c) => c.arguments[0].repo);
		assert.deepStrictEqual(queriedRepos.sort(), [
			'committer-repo',
			'empty-repo',
			'ownerless-repo',
		]);
	});
});
