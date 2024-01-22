import type { Octokit } from 'octokit';
import { composeCreatePullRequest } from 'octokit-plugin-create-pull-request';

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

export async function getPullRequest(
	octokit: Octokit,
	repoName: string,
	branchName: string,
) {
	// TODO(@chrislomaxjones) pagination necessary?
	const pulls = await octokit.rest.pulls.list({
		owner: 'guardian',
		repo: repoName,
		state: 'open',
	});
	return pulls.data.find((pull) => pull.head.ref === branchName);
}
