import { join } from 'path';
import type { Octokit } from '@octokit/rest';
import { putItem } from '../../common/aws/s3';
import { getConfig } from '../../common/config';
import type {
	RepositoriesResponse,
	TeamRepoResponse,
} from '../../common/github/github';
import {
	getOctokit,
	getReposForTeam, getTeams,
	listRepositories,
	listTeams, listTeamsForLocalDevelopment,
} from '../../common/github/github';
import type { Repository } from "./transformations";
import {
	findOwnersOfRepo,
	getAdminReposFromResponse,
	RepoAndOwner,
	transformRepo,
} from "./transformations";

const save = (
	dataKeyPrefix: string,
	dataBucketName: string | undefined,
	repos: Repository[],
): Promise<void> => {
	const key = join(dataKeyPrefix, 'github', 'repos.json');

	return putItem(key, repos, dataBucketName);
};

const createOwnerObjects = async (
    client: Octokit,
	teamSlug: string,
): Promise<RepoAndOwner[]> => {
	const allRepos: TeamRepoResponse = await getReposForTeam(client, teamSlug);
	const adminRepos: string[] = getAdminReposFromResponse(allRepos);
	return adminRepos.map((repoName) => new RepoAndOwner(teamSlug, repoName));
};

export const main = async (): Promise<void> => {
	console.log('[INFO] starting repo-fetcher');

	const config = await getConfig();
    const client = getOctokit(config);

	const stage=config.stage
	console.log(`[INFO] stage is ${stage}`);

	const teamNames = await getTeams(config.stage,client)

	console.log(`[INFO] found ${teamNames.length} github teams`);


	const reposAndOwners: RepoAndOwner[] = (
		await Promise.all(
          teamNames.map((team) => createOwnerObjects(client, team.slug)),
		)
	).flat();

	console.log(`[INFO] ran createOwnerObjects`);

	const reposResponse: RepositoriesResponse = await listRepositories(client);

	console.log(`[INFO] ran listRepositories`);

	const repos = reposResponse.map((response) =>
		transformRepo(response, findOwnersOfRepo(response.name, reposAndOwners)),
	);

	console.log(`[INFO] ran transformRepo`);

	await save(config.dataKeyPrefix, config.dataBucketName, repos);

	console.log(`[INFO] ran save to bucket`);

	console.log(`[INFO] found ${repos.length} repos`);
	console.log(`[INFO] finishing repo-fetcher`);
};

if (require.main === module) {
	void (async () => await main())();
}
