import assert from 'assert';
import { describe, it } from 'node:test';
import type { Octokit } from 'octokit';
import { createPullRequest, generateBranchName } from './pull-requests.js';

void describe('generateBranchName', () => {
	void it('does not produce the same branch name twice', () => {
		const prefix = 'hello';
		const branch1 = generateBranchName(prefix);
		const branch2 = generateBranchName(prefix);
		assert.notStrictEqual(branch1, branch2);
	});
});

void describe('createPullRequest', () => {
	void it('uses the repository default branch when no base branch is supplied', async () => {
		const requests: Array<{
			route: string;
			parameters: Record<string, unknown>;
		}> = [];

		const request = (
			route: string,
			parameters: Record<string, unknown> = {},
		) => {
			requests.push({ route, parameters });

			switch (route) {
				case 'GET /repos/{owner}/{repo}':
					return {
						data: {
							default_branch: 'trunk',
							permissions: { push: true },
						},
						headers: {},
					};
				case 'GET /repos/{owner}/{repo}/commits':
					return {
						data: [
							{
								sha: 'base-commit-sha',
								commit: { tree: { sha: 'base-tree-sha' } },
							},
						],
					};
				case 'POST /repos/{owner}/{repo}/git/commits':
					return { data: { sha: 'new-commit-sha' } };
				case 'POST /repos/{owner}/{repo}/git/refs':
					return { data: {} };
				case 'POST /repos/{owner}/{repo}/pulls':
					return {
						data: {
							html_url: 'https://github.com/owner/repo/pull/123',
							number: 123,
						},
					};
				case 'POST /repos/{owner}/{repo}/issues/{number}/labels':
					return { data: [] };
				default:
					throw new Error(`Unexpected GitHub request: ${route}`);
			}
		};

		const octokit = {
			request,
			graphql: () => ({
				repository: { ref: null },
			}),
			log: { warn: () => undefined },
		} as unknown as Octokit;

		const pullRequest = await createPullRequest(octokit, {
			repoName: 'repo',
			owner: 'owner',
			title: 'Add dependency graph workflow',
			body: 'Test PR body',
			branchName: 'dependency-graph-test',
			changes: [
				{
					commitMessage: 'Add workflow',
					files: {},
				},
			],
			admins: [],
		});

		assert.deepStrictEqual(pullRequest, {
			html_url: 'https://github.com/owner/repo/pull/123',
			number: 123,
		});

		const commitLookup = requests.find(
			({ route }) => route === 'GET /repos/{owner}/{repo}/commits',
		);
		assert.strictEqual(commitLookup?.parameters.sha, 'trunk');

		const createPullRequestRequest = requests.find(
			({ route }) => route === 'POST /repos/{owner}/{repo}/pulls',
		);
		assert.strictEqual(createPullRequestRequest?.parameters.base, 'trunk');
	});
});
