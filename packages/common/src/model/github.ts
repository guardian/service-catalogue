export interface Repository {
	name: string;
	private: boolean;
	created_at: string | undefined;
	updated_at: string | undefined;
	pushed_at: string | undefined;
	size: number | undefined;
	languages: string[];
	archived: boolean | undefined;
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
