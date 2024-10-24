import { randomBytes } from 'crypto';
import type { Octokit } from 'octokit';
import type { PullRequest, PullRequestParameters, StatusCode } from './types';

export function generateBranchName(prefix: string) {
	return `${prefix}-${randomBytes(8).toString('hex')}`;
}

function isGithubAuthor(pull: PullRequest, author: string) {
	return pull.user?.login === author && pull.user.type === 'Bot';
}

export async function getExistingPullRequest(
	octokit: Octokit,
	repoName: string,
	author: string,
	owner: string,
): Promise<PullRequest | undefined> {
	const pulls = await octokit.paginate(octokit.rest.pulls.list, {
		owner,
		repo: repoName,
		state: 'open',
	} satisfies PullRequestParameters);

	const found = pulls.filter((pull) => isGithubAuthor(pull, author));

	if (found.length > 1) {
		console.warn(`More than one PR found on ${repoName} - choosing the first.`);
	}

	return found[0] ?? undefined;
}

const ghHeaders = { 'X-GitHub-Api-Version': '2022-11-28' };

export async function enableDependabotAlerts(
	repo: string,
	octokit: Octokit,
	owner: string,
): Promise<StatusCode> {
	console.log(`Enabling Dependabot alerts for ${repo}`);
	const enableResponse = await octokit.request(
		'PUT /repos/{owner}/{repo}/vulnerability-alerts',
		{
			owner,
			repo,
			headers: ghHeaders,
		},
	);
	return enableResponse.status;
}
