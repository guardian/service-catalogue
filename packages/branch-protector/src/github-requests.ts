import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from 'octokit';
import type { Config } from './config';
import type { UpdateBranchProtectionParams } from './model';

export async function getGithubClient(config: Config) {
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

export async function updateBranchProtection(
	octokit: Octokit,
	owner: string,
	repo: string,
	branch: string,
) {
	console.log(`Attempting to apply branch protection to ${repo}`);
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
	try {
		await octokit.rest.repos.updateBranchProtection(branchProtectionParams);
		console.log(`Branch protection successfully applied to ${repo}`);
	} catch (error) {
		console.error(`Error: branch protection failed for ${repo}`);
		console.error(error);
	}
}

export async function getDefaultBranchName(
	owner: string,
	repo: string,
	octokit: Octokit,
) {
	const data = await octokit.rest.repos.get({ owner: owner, repo: repo });
	return data.data.default_branch;
}

export async function isBranchProtected(
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
