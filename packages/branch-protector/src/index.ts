import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import { createAppAuth } from '@octokit/auth-app';
import type { Endpoints } from '@octokit/types';
import { Octokit } from 'octokit';
import { getConfig } from './config';
import type { Config } from './config';
import type { UpdateBranchProtectionEvent } from './model';

export type UpdateBranchProtectionParams =
	Endpoints['PUT /repos/{owner}/{repo}/branches/{branch}/protection']['parameters'];

export async function updateBranchProtection(
	octokit: Octokit,
	owner: string,
	repo: string,
	branch: string,
) {
	console.log(`Updating ${repo} branch protection`);
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
	console.log(`Update of ${repo} successful`);
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

async function getGithubClient(config: Config) {
	const auth = createAppAuth(config.githubAppConfig.strategyOptions);

	const installationAuthentication = await auth({
		type: 'installation',
		installationId: config.githubAppConfig.installationId,
	});

	const octokit: Octokit = new Octokit({
		auth: installationAuthentication.token,
	});
	return octokit;
}

async function notify(fullRepoName: string, topicArn: string, slug: string) {
	const client = new Anghammarad();
	await client.notify({
		subject: 'Hello',
		message: `Branch protection has been applied to ${fullRepoName}`,
		actions: [
			{
				cta: 'Check branch protections here',
				url: `https://github.com/${fullRepoName}/settings/branches`,
			},
		],
		target: { GithubTeamSlug: slug },
		channel: RequestedChannel.PreferHangouts,
		sourceSystem: 'branch-protector',
		topicArn: topicArn,
	});
}

export async function main(event: UpdateBranchProtectionEvent) {
	const config: Config = await getConfig();
	const octokit: Octokit = await getGithubClient(config);

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
	} else {
		await updateBranchProtection(octokit, owner, repo, defaultBranchName);
		for (const slug of event.teamNameSlugs) {
			await notify(event.fullName, config.anghammaradSnsTopic, slug);
		}
		console.log(`Notified teams`);
	}
}
