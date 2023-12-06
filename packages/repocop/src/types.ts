export interface RepoAndStack {
	fullName: string;
	stacks: string[];
}

export interface Repository {
	archived: boolean;
	name: string;
	full_name: string;
	topics: string[];
	updated_at: Date | null;
	pushed_at: Date | null;
	created_at: Date;
	id: bigint;
	default_branch: string | null;
}
