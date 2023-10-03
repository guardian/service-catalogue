import { SSM, SSMClient } from '@aws-sdk/client-ssm';
import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import type { Endpoints } from '@octokit/types';
import { Octokit } from 'octokit';
import type { Config } from './config';
import type { UpdateBranchProtectionEvent } from './model';

//TODO: move to a common place
export function getEnvOrThrow(key: string): string {
	const value: string | undefined = process.env[key];
	if (value === undefined) {
		throw new Error(`Environment variable ${key} is not set`);
	}
	return value;
}

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
export async function webhook(
	repo: string,
	googleChatUrl: string,
): Promise<void> {
	//TODO: when we have the initial warning message set up, we can pass the thread key through to reply to the initial message
	const data: string = JSON.stringify({
		text: `${repo} branch protection updated.\nThis message was sent by repocop, part of the service-catalogue.`,
		formattedText: `${repo} branch protection updated.\nThis message was sent by repocop, part of the [service-catalogue](https://github.com/guardian/service-catalogue).`,
	});

	//TODO do not log full URL in production
	console.log(`Sending message to ${googleChatUrl} with data ${data}`);

	const resp = await fetch(googleChatUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json; charset=UTF-8',
		},
		body: data,
	});
	console.log(resp.status);
}

async function getAnghammaradTopic(region: string): Promise<string> {
	const ssmClient = new SSMClient({ region });
	const ssm = new SSM(ssmClient);
	const topic = await ssm.getParameter({
		Name: '/account/services/anghammarad.topic.arn',
		WithDecryption: true,
	});

	if (topic.Parameter === undefined) {
		throw new Error('Topic not found');
	}
	return topic.Parameter.Value!;
}

async function notify(fullRepoName: string, topicArn: string) {
	const client = new Anghammarad();
	await client.notify({
		subject: 'Hello',
		message: `Branch protection has been applied to ${fullRepoName}`,
		actions: [], //TODO: add a link to the repo prompting users to check the branch protection
		target: { Stack: 'deploy' }, //TODO use a GitHubTeamSlug target when new version of anghammarad is released. For now, send all messages to DevX
		channel: RequestedChannel.PreferHangouts,
		sourceSystem: 'branch-protector',
		topicArn: topicArn,
	});
}

export async function main(event: UpdateBranchProtectionEvent) {
	const config: Config = {
		stage: process.env['STAGE'] ?? 'DEV',
		githubAccessToken: getEnvOrThrow('GITHUB_ACCESS_TOKEN'),
		anghammaradSnsTopic: await getAnghammaradTopic('eu-west-1'),
	};
	const octokit: Octokit = new Octokit({ auth: config.githubAccessToken });

	const [org, repo] = event.fullName.split('/');

	const defaultBranchName = await getDefaultBranchName(org, repo, octokit);
	const isProtected = await isBranchProtected(
		octokit,
		org,
		repo,
		defaultBranchName,
	);

	console.log(`Is ${repo} protected? ${isProtected.toString()}`);
	if (isProtected) {
		console.log(`${repo}'s default branch is protected. No action required`);
	} else {
		console.log(`Updating ${repo} branch protection`);
		await updateBranchProtection(octokit, org, repo, defaultBranchName);
		console.log(`Update of ${repo} successful`);
		await notify(repo, config.anghammaradSnsTopic);
	}
}
