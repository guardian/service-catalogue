import { randomBytes } from 'crypto';
import { stageAwareOctokit } from 'common/src/functions.js';
import { addPrToProject } from 'common/src/projects-graphql.js';
import type { Octokit } from 'octokit';
import { composeCreatePullRequest } from 'octokit-plugin-create-pull-request';

interface Change {
	commitMessage: string;
	files: Record<string, string>;
}

interface CreatePullRequestOptions {
	repoName: string;
	owner: string;
	title: string;
	body: string;
	branchName: string;
	baseBranch?: string;
	changes: Change[];
	admins: string[];
}

export function generateBranchName(prefix: string) {
	return `${prefix}-${randomBytes(8).toString('hex')}`;
}

interface UrlAndNumber {
	html_url: string | undefined;
	number: number | undefined;
}

/**
 * Creates or updates a pull request, and return its URL.
 * On error, an exception is thrown, or undefined is returned.
 */
export async function createPullRequest(
	octokit: Octokit,
	props: CreatePullRequestOptions,
): Promise<UrlAndNumber | undefined> {
	const {
		repoName,
		owner,
		title,
		body,
		branchName,
		baseBranch = 'main',
		changes,
	} = props;

	const response = await composeCreatePullRequest(octokit, {
		owner,
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

	console.log('PR url:', response?.data.html_url);
	console.log('PR number:', response?.data.number);

	return response?.data as UrlAndNumber;
}

export async function requestTeamReview(
	octokit: Octokit,
	repoName: string,
	owner: string,
	pullNumber: number,
	admins: string[],
) {
	console.log('Requesting team review:', admins);
	if (admins.length > 0) {
		const response = await octokit.rest.pulls.requestReviewers({
			owner,
			repo: repoName,
			pull_number: pullNumber,
			team_reviewers: admins,
		});
		console.log('Requested team review:', response.data.requested_teams);
		console.log(response.status);
		return response;
	} else {
		console.log('No team reviewers to request');
		return undefined;
	}
}

export async function createPrAndAddToProject(
	stage: string,
	repoName: string,
	owner: string,
	author: string,
	branch: string,
	prTitle: string,
	prBody: string,
	fileName: string,
	fileContents: string,
	commitMessage: string,
	boardNumber: number,
	admins: string[],
	octokit?: Octokit,
) {
	if (stage === 'PROD') {
		const ghClient = octokit ?? (await stageAwareOctokit(stage));

		const pullRequestResponse = await createPullRequest(ghClient, {
			repoName,
			owner,
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

		if (pullRequestResponse?.html_url && pullRequestResponse.number) {
			console.log(
				'Pull request successfully created:',
				pullRequestResponse.html_url,
			);

			await requestTeamReview(
				ghClient,
				repoName,
				owner,
				pullRequestResponse.number,
				admins,
			);

			await addPrToProject(stage, repoName, boardNumber, author);
			console.log('Updated project board');
		} else {
			console.log('Pull request not created.');
		}
	} else {
		console.log(`Testing generation of ${fileName} for ${repoName}`);
		console.log(fileContents);
		console.log('Testing PR generation');
		console.log('Title:\n', prTitle);
		console.log('Body:\n', prBody);
	}
	console.log('Done');
}
