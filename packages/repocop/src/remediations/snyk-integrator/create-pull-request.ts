import { randomBytes } from 'crypto';
import type { Octokit } from 'octokit';
import { composeCreatePullRequest } from 'octokit-plugin-create-pull-request';
import { createYaml, generatePr } from './snyk-integrator';

interface CreatePullRequestOptions {
	fullRepoName: string;
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
		fullRepoName,
		title,
		body,
		branchName,
		baseBranch = 'main',
		changes,
	}: CreatePullRequestOptions,
) {
	return await composeCreatePullRequest(octokit, {
		owner: 'guardian',
		repo: fullRepoName,
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

export async function createSnykPullRequest(
	octokit: Octokit,
	fullRepoName: string,
	repoLanguages: string[],
) {
	// Introduce a random suffix to allow the same PR to be raised multiple times
	// Useful for testing, but may be less useful in production
	const branchName = `integrate-snyk-${randomBytes(8).toString('hex')}`;
	const snykFileContents = createYaml(repoLanguages);
	const [title, body] = generatePr(repoLanguages, branchName, fullRepoName);
	return await createPullRequest(octokit, {
		fullRepoName,
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
