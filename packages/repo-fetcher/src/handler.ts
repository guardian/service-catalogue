import { join } from 'path';
import type { Octokit } from '@octokit/rest';
import { S3Ops } from '../../common/aws/s3';
import { getConfig } from '../../common/config';
import type {
	RepositoriesResponse,
	TeamRepoResponse,
} from '../../common/github/github';
import {
	getOctokit,
	getReposForTeam,
	listRepositories,
	listTeams,
} from '../../common/github/github';
import { configureLogging, getLogLevel } from '../../common/log/log';
import type { Repository } from './transformations';
import {
	findOwnersOfRepo,
	getAdminReposFromResponse,
	RepoAndOwner,
	transformRepo,
} from './transformations';

const createOwnerObjects = async (
	client: Octokit,
	teamSlug: string,
): Promise<RepoAndOwner[]> => {
	const allRepos: TeamRepoResponse = await getReposForTeam(client, teamSlug);
	const adminRepos: string[] = getAdminReposFromResponse(allRepos);
	return adminRepos.map((repoName) => new RepoAndOwner(teamSlug, repoName));
};

export const main = async (): Promise<void> => {
	configureLogging(getLogLevel(process.env['LOG_LEVEL']));

	console.log('Starting repo-fetcher');

	const config = await getConfig();
	const client = getOctokit(config);
	const teamNames = await listTeams(client);

	const s3Ops = new S3Ops(config.region, config.endpoint);

	console.log(`Found ${teamNames.length} github teams`);

	const reposAndOwners: RepoAndOwner[] = (
		await Promise.all(
			teamNames.map((team) => createOwnerObjects(client, team.slug)),
		)
	).flat();

	const reposResponse: RepositoriesResponse = await listRepositories(client);
	const repos = reposResponse.map((response) =>
		transformRepo(response, findOwnersOfRepo(response.name, reposAndOwners)),
	);

	await s3Ops.putObject(config.bucketName, config.dataKeyPrefix, repos);

	console.log(`Found ${repos.length} repos`);
	console.log(`Finishing repo-fetcher`);
};

if (require.main === module) {
	void (async () => await main())();
}
