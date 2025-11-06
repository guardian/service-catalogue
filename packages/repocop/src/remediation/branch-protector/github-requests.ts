import type { Octokit } from 'octokit';
import type { UpdateBranchProtectionParams } from './model.js';

export async function updateBranchProtection(
	octokit: Octokit,
	owner: string,
	repo: string,
	branch: string,
) {
	console.log(`Applying branch protection to ${repo}`);
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

// temp function
export async function setRepoCustomProperty(
	octokit: Octokit,
	gitHubOrg: string,
	repoName: string,
	propertyName: string,
	propertyValue: string,
) {
	await octokit.request('PATCH /repos/{owner}/{repo}/properties/values', {
		owner: gitHubOrg,
		repo: repoName,
		properties: [
			{
				property_name: propertyName,
				value: propertyValue,
			},
		],
		headers: {
			'X-GitHub-Api-Version': '2022-11-28',
		},
	});
	console.log(
		`Have set ${gitHubOrg}/${repoName}'s custom property ${propertyName} to ${propertyValue}`,
	);
}
// end temp
