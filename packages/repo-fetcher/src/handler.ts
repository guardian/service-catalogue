import path from 'path';
import type { Octokit } from '@octokit/rest';
import { getS3Client, putObject } from 'common/aws/s3';
import {
	getOctokit,
	getReposForTeam,
	listRepositories,
	listTeams,
} from 'common/github/github';
import { configureLogging, getLogLevel } from 'common/log/log';
import { getConfig } from './config';
import { asRepo, getAdminReposFromResponse } from './transformations';

// Returns a map of repoName -> admins (a list of team slugs).
const teamRepositories = async (
	client: Octokit,
	teamNames: string[],
): Promise<Record<string, string[] | undefined>> => {
	const teamRepositories = teamNames.map(async (teamName) => {
		const teamRepos = await getReposForTeam(client, teamName);
		const adminRepos: string[] = getAdminReposFromResponse(teamRepos);
		return adminRepos.map((repoName) => ({
			teamSlug: teamName,
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

async function getTeamNames(
	client: Octokit,
	teamName?: string,
): Promise<string[]> {
	if (teamName) {
		return Promise.resolve([teamName]);
	}

	const allTeams = await listTeams(client);
	return allTeams.map((_) => _.slug);
}

export const main = async (): Promise<void> => {
	const config = await getConfig();
	configureLogging(getLogLevel(config.logLevel));

	console.log('Starting repo-fetcher');

	const client = getOctokit(config.github);

	const teamNames = await getTeamNames(client, config.github.teamToFetch);
	console.log(`Found ${teamNames.length} github teams`);

	const repositories = await listRepositories(client);
	console.log(`Found ${repositories.length} github repos`);

	const repositoriesToAdmins = await teamRepositories(client, teamNames);

	const repos = repositories.map((repository) =>
		asRepo(repository, repositoriesToAdmins[repository.name] ?? []),
	);

	const s3Client = getS3Client(config.region);
	const repoFileLocation = path.join(config.dataKeyPrefix, 'repos.json');

	await putObject(s3Client, config.dataBucketName, repoFileLocation, repos);

	console.log(`Finishing repo-fetcher`);
};

if (require.main === module) {
	void (async () => await main())();
}
