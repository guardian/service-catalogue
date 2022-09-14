import { putItem } from '../../common/aws/s3';
import { config } from '../../common/config';
import type { Config } from '../../common/config';
import type {
	RepositoriesResponse,
	TeamRepoResponse,
} from '../../common/github/github';
import {
	getReposForTeam,
	listRepositories,
	listTeams,
} from '../../common/github/github';
import {
	findOwnersOfRepo,
	getAdminReposFromResponse,
	RepoAndOwner,
	transformRepo,
} from '../src/transformations';

const save = (JsonString: string, path: string): Promise<void> => {
	const prefix: string = config.dataKeyPrefix;
	const key = `${prefix}/${path}`;

	return putItem(key, JsonString, config.dataBucketName);
};

const createOwnerObjects = async (
	config: Config,
	teamSlug: string,
): Promise<RepoAndOwner[]> => {
	const allRepos: TeamRepoResponse = await getReposForTeam(config, teamSlug);
	const adminRepos: string[] = getAdminReposFromResponse(allRepos);
	return adminRepos.map((repoName) => new RepoAndOwner(teamSlug, repoName));
};

export const main = async (): Promise<void> => {
	console.log('[INFO] starting repo-fetcher');

	const teamNames = await listTeams(config);
	console.log(`[INFO] found ${teamNames.length} github teams`);

	const reposAndOwners: RepoAndOwner[] = (
		await Promise.all(
			teamNames.map((team) => createOwnerObjects(config, team.slug)),
		)
	).flat();
	const reposResponse: RepositoriesResponse = await listRepositories(config);
	const repos = reposResponse.map((response) =>
		transformRepo(response, findOwnersOfRepo(response.name, reposAndOwners)),
	);
	await save(JSON.stringify(repos), 'github/repos.json');
	console.log(`[INFO] found ${repos.length} repos`);
	console.log(`[INFO] finishing repo-fetcher`);
};

if (require.main === module) {
	void (async () => await main())();
}
