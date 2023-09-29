export interface UpdateBranchProtectionEvent {
	fullName: string; // in the format of owner/repo-name
	teamNameSlugs: string[];
}
