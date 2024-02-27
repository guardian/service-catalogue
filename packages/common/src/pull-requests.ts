import { randomBytes } from 'crypto';
import type { Endpoints } from '@octokit/types';
import type { Octokit } from 'octokit';
import { composeCreatePullRequest } from 'octokit-plugin-create-pull-request';
import { stageAwareOctokit } from './functions';
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
		console.warn(`More than one PR found on ${repoName} - choosing the first.`);
	}

	return found[0];
}

function logPr(
	fileName: string,
	repoName: string,
	fileContents: string,
	prTitle: string,
	prBody: string,
) {
	console.log(`Testing generation of ${fileName} for ${repoName}`);
	console.log(fileContents);
	console.log('Testing PR generation');
	console.log('Title:\n', prTitle);
	console.log('Body:\n', prBody);
}

async function hasBranchProtection(
	octokit: Octokit,
	repoName: string,
): Promise<boolean> {
	const protection = await octokit.rest.repos.getBranchProtection({
		owner: 'guardian',
		repo: repoName,
		branch: 'main',
	});

	console.log(protection.data);

	return (
		protection.data.enabled === true &&
		!!protection.data.required_pull_request_reviews
	);
}

async function productionCustomProperty(
	octokit: Octokit,
	repoName: string,
): Promise<boolean> {
	const allResults = await octokit.request(
		'GET /repos/{owner}/{repo}/properties/values',
		{
			owner: 'guardian',
			repo: repoName,
			headers: {
				'X-GitHub-Api-Version': '2022-11-28',
			},
		},
	);

	console.log(allResults.data);

	const result = allResults.data.find(
		(property) =>
			property.property_name === 'production_status' &&
			property.value === 'production',
	);

	return !!result;
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
) {
	// Early return if not on PROD so we don't try to create a GitHub client
	if (stage !== 'PROD') {
		console.log('Skipping PR creation. Non-PROD stage detected');
		logPr(fileName, repoName, fileContents, prTitle, prBody);
		return;
	}

	const octokit = await stageAwareOctokit(stage);

	const existingPullRequest = await getExistingPullRequest(
		octokit,
		repoName,
		`${author}[bot]`,
	);

	const branchIsUnprotected = !(await hasBranchProtection(octokit, repoName));
	const noProductionRuleset = !(await productionCustomProperty(
		octokit,
		repoName,
	));

	if (branchIsUnprotected || noProductionRuleset) {
		console.warn(
			`Branch protection not enabled for ${branch} on ${repoName}. Skipping PR creation.`,
		);
		logPr(fileName, repoName, fileContents, prTitle, prBody);
	} else if (existingPullRequest) {
		console.log(
			`Existing pull request found. Skipping creating a new one.`,
			existingPullRequest.html_url,
		);
		logPr(fileName, repoName, fileContents, prTitle, prBody);
	} else {
		console.log('Creating PR');

		const response = await createPullRequest(octokit, {
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
		console.log('Pull request successfully created:', response?.data.html_url);
		await addPrToProject(stage, repoName, boardNumber, author);
		console.log('Updated project board');
	}
}
