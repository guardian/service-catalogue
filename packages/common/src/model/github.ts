export interface Repository {
	id: number;
	name: string;
	full_name: string;
	private: boolean;
	description: string | null;
	created_at: Date | null;
	updated_at: Date | null;
	pushed_at: Date | null;
	size: number | undefined;
	languages: string[];
	archived: boolean | undefined;
	open_issues_count: number | undefined;
	is_template: boolean | undefined;
	topics: string[] | undefined;
	default_branch: string | undefined;
	owners: string[];
	lastCommit?: Commit;
}

export interface Team {
	id: number;
	name: string;
	slug: string;
	repos: Repository[];
}

export interface Commit {
	message: string;
	author?: string;
	date?: string;
	sha?: string;
}

export interface Member {
	name: string | undefined;
	login: string;
	id: number;
	teams: string[];
}
