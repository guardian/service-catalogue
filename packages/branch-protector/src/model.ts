import type { Endpoints } from '@octokit/types';

export interface UpdateBranchProtectionEvent {
	fullName: string; // in the format of owner/repo-name
	teamNameSlugs: string[];
}

export type UpdateBranchProtectionParams =
	Endpoints['PUT /repos/{owner}/{repo}/branches/{branch}/protection']['parameters'];
