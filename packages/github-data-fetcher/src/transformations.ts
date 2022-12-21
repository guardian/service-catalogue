import type {
	MemberResponse,
	RepositoryResponse,
	TeamRepoResponse,
} from 'common/github/github';
import type { Commit, Member, Repository } from 'common/model/github';

export const asMember = (member: MemberResponse, teams: string[]): Member => {
	return {
		id: member.id,
		name: member.name ?? undefined,
		login: member.login,
		teams,
	};
};

function eliminateUndefined<T>(t: T | null | undefined): T | null {
	if (t === undefined) {
		return null;
	} else {
		return t;
	}
}

export const asRepo = (
	repo: RepositoryResponse,
	owners: string[],
	languages: string[],
	lastCommit?: Commit,
): Repository => {
	return {
		name: repo.name,
		private: repo.private,
		created_at: eliminateUndefined<string>(repo.created_at),
		updated_at: eliminateUndefined<string>(repo.updated_at),
		pushed_at: eliminateUndefined<string>(repo.pushed_at),
		size: repo.size,
		archived: repo.archived,
		topics: repo.topics,
		default_branch: repo.default_branch,
		owners,
		languages,
		lastCommit,
	};
};

export interface RepoAndOwner {
	teamSlug: string;
	repoName: string;
}

export const getAdminReposFromResponse = (
	repos: TeamRepoResponse,
): string[] => {
	return repos
		.filter((repo) => repo.role_name === 'admin')
		.map((repo) => repo.name);
};

export const findOwnersOfRepo = (
	repoName: string,
	ownerObjects: RepoAndOwner[],
): string[] => {
	return ownerObjects
		.filter((repoAndOwner) => repoAndOwner.repoName == repoName)
		.map((repoAndOwner) => repoAndOwner.teamSlug);
};
