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
	language: string | null | undefined;
	archived: boolean | undefined;
	open_issues_count: number | undefined;
	is_template: boolean | undefined;
	topics: string[] | undefined;
	default_branch: string | undefined;
	owners: string[];
}

export interface Team {
	id: number;
	name: string;
	slug: string;
	repos: Repository[];
}
