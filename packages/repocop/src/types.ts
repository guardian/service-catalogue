export interface RepoAndStack {
	full_name: string;
	stacks: string[];
}

export interface RepoAndArchiveStatus {
	full_name: string;
	name: string;
	archived: boolean;
}
