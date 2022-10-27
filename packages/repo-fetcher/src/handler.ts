import type { Octokit } from '@octokit/rest';
import { getS3Client, putObject } from '../../common/aws/s3';
import { getConfig } from '../../common/config';
import type { TeamsResponse } from '../../common/github/github';
import {
	getOctokit,
	getReposForTeam,
	listRepositories,
	listTeams,
} from '../../common/github/github';
import { configureLogging, getLogLevel } from '../../common/log/log';
import { asRepo, getAdminReposFromResponse } from './transformations';

// Returns a map of repoName -> admins (a list of team slugs).
const teamRepositories = async (
	client: Octokit,
	teams: TeamsResponse,
): Promise<Record<string, string[] | undefined>> => {
	const teamRepositories = teams.map(async (team) => {
		const teamRepos = await getReposForTeam(client, team.slug);
		const adminRepos: string[] = getAdminReposFromResponse(teamRepos);
		return adminRepos.map((repoName) => ({
			teamSlug: team.slug,
			repoName,
		}));
	});

	const flattened = (await Promise.all(teamRepositories)).flat();

	return flattened.reduce<Record<string, string[] | undefined>>((acc, repo) => {
		const existing = acc[repo.repoName] ?? [];
		acc[repo.repoName] = existing.concat(repo.teamSlug);
		return acc;
	}, {});
};

export const main = async (): Promise<void> => {
	const config = await getConfig();
	configureLogging(getLogLevel(config.logLevel));

	console.log('Starting repo-fetcher');

	const client = getOctokit(config);

	const teams = await listTeams(client);
	console.log(`Found ${teams.length} github teams`);

	const repositories = await listRepositories(client);
	console.log(`Found ${repositories.length} github repos`);

	const repositoriesToAdmins = await teamRepositories(client, teams);

	const repos = repositories.map((repository) =>
		asRepo(repository, repositoriesToAdmins[repository.name] ?? []),
	);

	const s3Client = getS3Client(config.region);
	await putObject(s3Client, config.dataBucketName, config.dataKeyPrefix, repos);

	console.log(`Finishing repo-fetcher`);
};

if (require.main === module) {
	void (async () => await main())();
}
