import type { Endpoints } from '@octokit/types';
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

type PullRequestParameters =
	Endpoints['GET /repos/{owner}/{repo}/pulls']['parameters'];

type PullRequest =
	Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'][number];

const GITHUB_BOT_LOGIN = 'gu-snyk-integrator[bot]';

function isGithubAppAuthor(pull: PullRequest) {
	return pull.user?.login === GITHUB_BOT_LOGIN && pull.user.type === 'Bot';
}

export async function getPullRequest(
	octokit: Octokit,
	repoName: string,
	branchName: string,
) {
	const pulls = await octokit.paginate(octokit.rest.pulls.list, {
		owner: 'guardian',
		repo: repoName,
		state: 'open',
	} satisfies PullRequestParameters);
	return pulls.find(
		(pull) => pull.head.ref === branchName && isGithubAppAuthor(pull),
	);
}
