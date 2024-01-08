import { randomBytes } from 'crypto';
import type { Octokit } from 'octokit';
import { composeCreatePullRequest } from 'octokit-plugin-create-pull-request';
import { createYaml } from './snyk-integrator';

interface CreatePullRequestOptions {
	repoName: string;
	title: string;
	body: string;
	branchName: string;
	baseBranch?: string;
	changes: Array<{
		commitMessage: string;
		files: Record<string, string>;
	}>;
}

export async function createPullRequest(
	octokit: Octokit,
	{
		repoName,
		title,
		body,
		branchName,
		baseBranch = 'main',
		changes,
	}: CreatePullRequestOptions,
) {
	return await composeCreatePullRequest(octokit, {
		owner: 'guardian',
		repo: repoName,
		title,
		body,
		head: branchName,
		base: baseBranch,
		changes: changes.map(({ commitMessage, files }) => ({
			commit: commitMessage,
			files: files,
		})),
	});
}

function createPullRequestTitle(languages: string[]) {
	return `Integrate ${languages.join(', ')} code with Snyk`;
}

function createPullRequestBody(languages: string[]) {
	// TODO Use actual pull request body
	return `Example PR body (languages: ${languages.join(', ')})`;
}

export async function createSnykPullRequest(
	octokit: Octokit,
	repoName: string,
	languages: string[],
) {
	// Introduce a random suffix to allow the same PR to be raised multiple times
	// Useful for testing, but may be less useful in production
	const branchName = `integrate-snyk-${randomBytes(8).toString('hex')}`;
	const snykFileContents = createYaml(languages);
	const title = createPullRequestTitle(languages);
	const body = createPullRequestBody(languages);
	return await createPullRequest(octokit, {
		repoName,
		title,
		body,
		branchName,
		changes: [
			{
				commitMessage: 'Add Snyk.yml',
				files: {
					'snyk.yml': snykFileContents,
				},
			},
		],
	});
}
