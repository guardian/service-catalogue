export interface GitHubRepository {
	full_name: string | null;
	default_branch: string | null;
	topics: string[] | null;
	id: bigint | null;
}

export type GitHubRepositories = GitHubRepository[];

export interface GitHubRepositoryBranch {
	repository_id: bigint;
	name: string;
	protected: boolean | null;
	protection: any;
}

export type GitHubRepositoryBranches = GitHubRepositoryBranch[];

export interface Repository01 {
	full_name: string;
	repository_01: boolean;
}

export interface Repository02 {
	full_name: string | null;
	repository_02: boolean | null;
}

export interface RepoRuleEvaluation {
	full_name: string;
	repository_01: boolean | null;
	repository_02: boolean | null;
}
