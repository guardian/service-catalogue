import type {
	MemberResponse,
	RepositoryResponse,
	TeamRepoResponse,
} from 'common/github/github';
import type { Commit, Member, Repository } from 'common/model/github';

const parseDateString = (
	dateString: string | null | undefined,
): Date | null => {
	if (
		dateString === undefined ||
		dateString === null ||
		dateString.length === 0
	) {
		return null;
	}
	return new Date(dateString);
};

export const asMember = (member: MemberResponse, teams: string[]): Member => {
	return {
		id: member.id,
		name: member.name ?? undefined,
		login: member.login,
		teams,
	};
};

export const asRepo = (
	repo: RepositoryResponse,
	owners: string[],
	languages: string[],
	lastCommit?: Commit,
): Repository => {
	return {
		name: repo.name,
		private: repo.private,
		description: repo.description,
		created_at: parseDateString(repo.created_at),
		updated_at: parseDateString(repo.updated_at),
		pushed_at: parseDateString(repo.pushed_at),
		size: repo.size,
		archived: repo.archived,
		open_issues_count: repo.open_issues_count,
		is_template: repo.is_template,
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
