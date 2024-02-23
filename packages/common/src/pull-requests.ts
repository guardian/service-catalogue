import { randomBytes } from 'crypto';
import type { Endpoints } from '@octokit/types';
import type { Octokit } from 'octokit';
import { composeCreatePullRequest } from 'octokit-plugin-create-pull-request';
import { addPrToProject } from './projects-graphql';

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

export function generateBranchName(prefix: string) {
	return `${prefix}-${randomBytes(8).toString('hex')}`;
}

export async function createPullRequest( //ignore the warning created here
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
			files,
		})),
	});
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
		owner: 'guardian',
		repo: repoName,
		state: 'open',
	} satisfies PullRequestParameters);

	const found = pulls.filter((pull) => isGithubAuthor(pull, author));

	if (found.length > 1) {
		console.warn(
			'More than one Snyk integrator PR found on repository - choosing the first.',
		);
	}

	return found[0];
}

export async function createPrAndAddToProject(
	stage: string,
	octokit: Octokit,
	repoName: string,
	author: string,
	branch: string,
	prTitle: string,
	prBody: string,
	fileName: string, //is this used?
	fileContents: string,
	commitMessage: string,
	boardNumber: number,
) {
	if (stage === 'PROD') {
		const existingPullRequest = await getExistingPullRequest(
			octokit,
			repoName,
			`${author}[bot]`,
		);

		if (!existingPullRequest) {
			const response = await createPullRequest(octokit, {
				repoName,
				title: prTitle,
				body: prBody,
				branchName: branch,
				changes: [
					{
						commitMessage,
						files: {
							fileName: fileContents,
						},
					},
				],
			});
			console.log(
				'Pull request successfully created:',
				response?.data.html_url,
			);
			await addPrToProject(stage, repoName, boardNumber, author);
			console.log('Updated project board');
		} else {
			console.log(
				`Existing pull request found. Skipping creating a new one.`,
				existingPullRequest.html_url,
			);
		}
	} else {
		console.log('Testing snyk.yml generation');
		console.log(fileContents);
		console.log('Testing PR generation');
		console.log('Title:\n', prTitle);
		console.log('Body:\n', prBody);
	}
	console.log('Done');
}
