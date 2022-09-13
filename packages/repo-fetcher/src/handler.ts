import { putItem } from '../../common/aws/s3';
import { getConfig } from '../../common/config';
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
import type { Repository } from '../src/transformations';
import {
	findOwnersOfRepo,
	getAdminReposFromResponse,
	RepoAndOwner,
	transformRepo,
} from '../src/transformations';

const save = (
	dataKeyPrefix: string | undefined,
	dataBucketName: string | undefined,
	repos: Repository[],
): Promise<void> => {
	const prefix = dataKeyPrefix ? `${dataKeyPrefix}/` : '';
	const key = `${prefix}github/repos.json`;

	return putItem(key, JSON.stringify(repos), dataBucketName);
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

	const config = await getConfig();

	const teamNames = await listTeams(config);
	const reposAndOwners: RepoAndOwner[] = (
		await Promise.all(
			teamNames.map((team) => createOwnerObjects(config, team.slug)),
		)
	).flat();
	const reposResponse: RepositoriesResponse = await listRepositories(config);
	const repos = reposResponse.map((response) =>
		transformRepo(response, findOwnersOfRepo(response.name, reposAndOwners)),
	);
	await save(config.dataKeyPrefix, config.dataBucketName, repos);

	console.log(`[INFO] found ${repos.length} repos`);
	console.log(`[INFO] finishing repo-fetcher`);
};

if (require.main === module) {
	void (async () => await main())();
}
