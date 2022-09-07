import type { Config } from '../../common/config';
import type { TeamRepoResponse } from '../../common/github/github';
import { getReposForTeam } from '../../common/github/github';

export class RepoAndOwner {
	teamSlug: string;
	repoName: string;
	constructor(teamSlug: string, repoName: string) {
		this.teamSlug = teamSlug;
		this.repoName = repoName;
	}
}

export const getAdminReposFromResponse = (
	repos: TeamRepoResponse,
): string[] => {
	return repos
		.filter((repo) => repo.role_name === 'admin')
		.map((repo) => repo.name);
};

export const createOwnerObjects = async (
	config: Config,
	teamSlug: string,
): Promise<RepoAndOwner[]> => {
	const allRepos: TeamRepoResponse = await getReposForTeam(config, teamSlug);
	const adminRepos: string[] = getAdminReposFromResponse(allRepos);
	return adminRepos.map((repoName) => new RepoAndOwner(teamSlug, repoName));
};

export const findOwnersOfRepo = (
	repoName: string,
	ownerObjects: RepoAndOwner[],
): string[] => {
	return ownerObjects
		.filter((repoAndOwner) => repoAndOwner.repoName == repoName)
		.map((repoAndOwner) => repoAndOwner.teamSlug);
};
