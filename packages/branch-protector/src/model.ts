interface TeamContact {
	slug: string;
	workspaceId: string;
}
export interface UpdateBranchProtectionEvent {
	fullName: string; // in the format of owner/repo-name
	teamContacts: TeamContact[];
}
