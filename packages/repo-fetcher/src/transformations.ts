import { getReposForTeam, TeamRepoResponse } from "../../common/github/github";
import { Config } from "../../common/config";

export class RepoAndOwner {
    teamSlug: string;
    repoName: string
    constructor(teamSlug: string, repoName: string) {
        this.teamSlug = teamSlug
        this.repoName = repoName
    }
}

export const getAdminReposFromResponse = (repos: TeamRepoResponse): string[] => {
    return repos.filter(repo => repo.role_name === "admin").map(repo => repo.name);
}

export const createOwnerObjects = async (config: Config, teamSlug: string): Promise<RepoAndOwner[]> => {
    const allRepos: TeamRepoResponse = await getReposForTeam(config, teamSlug);
    const adminRepos: string[] = getAdminReposFromResponse(allRepos);
    return adminRepos.map(repoName => new RepoAndOwner(teamSlug, repoName))
}

export const findOwnersOfRepo = (repoName: string, ownerObjects: RepoAndOwner[]): string[] => {
    return ownerObjects
        .filter(repoAndOwner => repoAndOwner.repoName == repoName)
        .map(repoAndOwner => repoAndOwner.repoName)
}