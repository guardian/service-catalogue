import type { Endpoints } from '@octokit/types';
import { Octokit } from 'octokit';
import type { UpdateBranchProtectionEvent } from './model';

//TODO: move to a common place
export function getEnvOrThrow(key: string): string {
	const value: string | undefined = process.env[key];
	if (value === undefined) {
		throw new Error(`Environment variable ${key} is not set`);
	}
	return value;
}

const authToken: string = getEnvOrThrow('GITHUB_ACCESS_TOKEN');

export type UpdateBranchProtectionParams =
	Endpoints['PUT /repos/{owner}/{repo}/branches/{branch}/protection']['parameters'];

export async function updateBranchProtection(
	octokit: Octokit,
	owner: string,
	repo: string,
	branch: string,
) {
	//https://github.com/guardian/recommendations/blob/main/github.md#branch-protection
	const branchProtectionParams: UpdateBranchProtectionParams = {
		owner: owner,
		repo: repo,
		branch: branch,
		required_status_checks: {
			strict: true,
			contexts: [],
		},
		restrictions: null,
		enforce_admins: true,
		required_pull_request_reviews: {
			require_code_owner_reviews: true,
			required_approving_review_count: 1,
		},
		allow_force_pushes: false,
		allow_deletions: false,
	};
	await octokit.rest.repos.updateBranchProtection(branchProtectionParams);
}

async function getDefaultBranchName(
	owner: string,
	repo: string,
	octokit: Octokit,
) {
	const data = await octokit.rest.repos.get({ owner: owner, repo: repo });
	return data.data.default_branch;
}

async function isBranchProtected(
	octokit: Octokit,
	owner: string,
	repo: string,
	branch: string,
): Promise<boolean> {
	const branchData = await octokit.rest.repos.getBranch({
		owner,
		repo,
		branch,
	});
	return branchData.data.protected;
}

/**
 * Sends asynchronous message into Google Chat
 */
export function webhook(repo: string, googleChatUrl: string): void {
	//TODO: when we have the initial warning message set up, we can pass the thread key through to reply to the initial message
	const data: string = JSON.stringify({
		text: `${repo} branch protection updated.\nThis message was sent by repocop, part of the service-catalogue.`,
		formattedText: `${repo} branch protection updated.\nThis message was sent by repocop, part of the [service-catalogue](https://github.com/guardian/service-catalogue).`,
	});

	//TODO do not log full URL in production
	console.log(`Sending message to ${googleChatUrl} with data ${data}`);
	console.log(data);
}

export async function main(event: UpdateBranchProtectionEvent) {
	const octokit: Octokit = new Octokit({ auth: authToken });

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we are happy to use it here
	const owner = event.fullName.split('/')[0]!;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we are happy to use it here
	const repo = event.fullName.split('/')[1]!;
	const defaultBranchName = await getDefaultBranchName(owner, repo, octokit);
	const isProtected = await isBranchProtected(
		octokit,
		owner,
		repo,
		defaultBranchName,
	);

	console.log(`Is ${repo} protected? ${isProtected.toString()}`);
	if (isProtected) {
		console.log(`${repo}'s default branch is protected. No action required`);
		webhook(repo, getEnvOrThrow('GOOGLE_CHAT_URL')); //TODO remove this when testing is finished
	} else {
		console.log(`Updating ${repo} branch protection`);
		await updateBranchProtection(octokit, owner, repo, defaultBranchName);
		console.log(`Update of ${repo} successful`);
		webhook(repo, getEnvOrThrow('GOOGLE_CHAT_URL')); //TODO get key from parameter store irl
	}
}
