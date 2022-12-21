export interface Repository {
	//before removing a field, check it isn't being used by RepoCop
	name: string;
	private: boolean;
	created_at: string | null;
	updated_at: string | null;
	pushed_at: string | null;
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
