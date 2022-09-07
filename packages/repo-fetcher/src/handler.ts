import { putItem } from '../../common/aws/s3';
import { config } from '../../common/config';
import type { RepositoriesResponse } from '../../common/github/github';
import { listRepositories, listTeams } from '../../common/github/github';
import type { RepoAndOwner, Repository } from '../src/transformations';
import {
	createOwnerObjects,
	findOwnersOfRepo,
	transformRepo,
} from '../src/transformations';

const save = (repos: Repository[]): Promise<void> => {
	const prefix = config.dataKeyPrefix;
	const key = `${prefix}/github/repos.json`;

	return putItem(key, JSON.stringify(repos), config.dataBucketName);
};

export const main = async (): Promise<void> => {
	console.log('[INFO] starting repo-fetcher');
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
	await save(repos);
	console.log(`[INFO] found ${repos.length} repos`);
	console.log(`[INFO] finishing repo-fetcher`);
};

if (require.main === module) {
	void (async () => await main())();
}
