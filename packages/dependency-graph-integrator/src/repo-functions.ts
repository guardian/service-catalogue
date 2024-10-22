import { randomBytes } from 'crypto';
import { createPullRequest } from 'common/src/pull-requests';
import type { Octokit } from 'octokit';
import { addPrToProject } from '../../common/src/projects-graphql';
import type { PullRequest, PullRequestParameters, StatusCode } from './types';

export function generateBranchName(prefix: string) {
	return `${prefix}-${randomBytes(8).toString('hex')}`;
}

function isGithubAuthor(pull: PullRequest, author: string) {
	return pull.user?.login === author && pull.user.type === 'Bot';
}

const OWNER = 'guardian';

export async function getExistingPullRequest(
	octokit: Octokit,
	repoName: string,
	author: string,
): Promise<PullRequest | undefined> {
	const pulls = await octokit.paginate(octokit.rest.pulls.list, {
		owner: OWNER,
		repo: repoName,
		state: 'open',
	} satisfies PullRequestParameters);

	const found = pulls.filter((pull) => isGithubAuthor(pull, author));

	if (found.length > 1) {
		console.warn(`More than one PR found on ${repoName} - choosing the first.`);
	}

	return found[0] ?? undefined;
}

export async function createPrAndAddToProject(
	stage: string,
	repoName: string,
	author: string,
	branch: string,
	prTitle: string,
	prBody: string,
	fileName: string,
	fileContents: string,
	commitMessage: string,
	boardNumber: number,
	octokit: Octokit,
	admins: string[],
) {
	const existingPullRequest = await getExistingPullRequest(
		octokit,
		repoName,
		`${author}[bot]`,
	);

	if (!existingPullRequest) {
		const pullRequestUrl = await createPullRequest(octokit, {
			repoName,
			owner: OWNER,
			title: prTitle,
			body: prBody,
			branchName: branch,
			changes: [
				{
					commitMessage,
					files: {
						[fileName]: fileContents,
					},
				},
			],
			admins,
		});

		if (pullRequestUrl) {
			console.log('Pull request successfully created:', pullRequestUrl);
			await addPrToProject(stage, repoName, boardNumber, author);
			console.log('Updated project board');
		}
	} else {
		console.log(
			`Existing pull request found. Skipping creating a new one.`,
			existingPullRequest.html_url,
		);
	}

	console.log('Done');
}

const ghHeaders = { 'X-GitHub-Api-Version': '2022-11-28' };

export async function enableDependabotAlerts(
	repo: string,
	octokit: Octokit,
): Promise<StatusCode> {
	console.log(`Enabling Dependabot alerts for ${repo}`);
	const enableResponse = await octokit.request(
		'PUT /repos/{owner}/{repo}/vulnerability-alerts',
		{
			owner: OWNER,
			repo,
			headers: ghHeaders,
		},
	);
	return enableResponse.status;
}
