import { randomBytes } from 'crypto';
import type { Endpoints } from '@octokit/types';
import type { Octokit } from 'octokit';
import { composeCreatePullRequest } from 'octokit-plugin-create-pull-request';
import { addPrToProject } from '../../common/src/projects-graphql';

interface Change {
	commitMessage: string;
	files: Record<string, string>;
}

interface CreatePullRequestOptions {
	repoName: string;
	title: string;
	body: string;
	branchName: string;
	baseBranch?: string;
	changes: Change[];
}

const OWNER = 'guardian';

export function generateBranchName(prefix: string) {
	return `${prefix}-${randomBytes(8).toString('hex')}`;
}

/**
 * Creates or updates a pull request, and return its URL.
 * On error, an exception is thrown, or undefined is returned.
 */
export async function createPullRequest(
	octokit: Octokit,
	props: CreatePullRequestOptions,
): Promise<string | undefined> {
	const {
		repoName,
		title,
		body,
		branchName,
		baseBranch = 'main',
		changes,
	} = props;

	const response = await composeCreatePullRequest(octokit, {
		owner: OWNER,
		repo: repoName,
		title,
		body,
		head: branchName,
		base: baseBranch,
		changes: changes.map(({ commitMessage, files }) => ({
			commit: commitMessage,
			files,
		})),
	});

	return response?.data.html_url;
}

type PullRequestParameters =
	Endpoints['GET /repos/{owner}/{repo}/pulls']['parameters'];

type PullRequest =
	Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'][number];

function isGithubAuthor(pull: PullRequest, author: string) {
	return pull.user?.login === author && pull.user.type === 'Bot';
}

export async function getExistingPullRequest(
	octokit: Octokit,
	repoName: string,
	author: string,
) {
	const pulls = await octokit.paginate(octokit.rest.pulls.list, {
		owner: OWNER,
		repo: repoName,
		state: 'open',
	} satisfies PullRequestParameters);

	const found = pulls.filter((pull) => isGithubAuthor(pull, author));

	if (found.length > 1) {
		console.warn(`More than one PR found on ${repoName} - choosing the first.`);
	}

	return found[0];
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
) {
	const existingPullRequest = await getExistingPullRequest(
		octokit,
		repoName,
		`${author}[bot]`,
	);

	if (!existingPullRequest) {
		const pullRequestUrl = await createPullRequest(octokit, {
			repoName,
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
): Promise<number> {
	const isEnabledResponse = await octokit.request(
		`GET /repos/${OWNER}/${repo}/vulnerability-alerts`,
		{
			owner: OWNER,
			repo,
			headers: ghHeaders,
		},
	);
	if (isEnabledResponse.status !== 204) {
		console.log(`Dependabot alerts not enabled for ${repo}, enabling them now`);
		const enableResponse = await octokit.request(
			`PUT /repos/${OWNER}/${repo}/vulnerability-alerts`,
			{
				owner: OWNER,
				repo,
				headers: ghHeaders,
			},
		);
		if (enableResponse.status !== 204) {
			console.warn(`Unable to enable Dependabot alerts for ${repo}`);
		}
		return enableResponse.status;
	} else {
		console.log(`Dependabot alerts are already enabled for ${repo}`);
		return isEnabledResponse.status;
	}
}
