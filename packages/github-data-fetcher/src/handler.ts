import path from 'path';
import type { Octokit } from '@octokit/rest';
import { getS3Client, putObject } from 'common/aws/s3';
import {
	getOctokit,
	getReposForTeam,
	getTeam,
	listRepositories,
	listTeams,
} from 'common/github/github';
import { configureLogging, getLogLevel } from 'common/log/log';
import type { Repository, Team } from 'common/model/github';
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

export interface TeamsAndRepositories {
	teams: Team[];
	repos: Repository[];
}

async function getTeamsAndRepositories(
	client: Octokit,
	teamName?: string,
): Promise<TeamsAndRepositories> {
	const teams = teamName
		? [await getTeam(client, teamName)]
		: await listTeams(client);

	console.log(`Found ${teams.length} github teams`);

	const repositories = await listRepositories(client);

	console.log(`Found ${repositories.length} github repos`);

	const repositoriesToAdmins = await teamRepositories(
		client,
		teams.map((_) => _.slug),
	);

	const repositoriesOutput = repositories.map((repository) =>
		asRepo(repository, repositoriesToAdmins[repository.name] ?? []),
	);

	const teamsMap = repositories.reduce<
		Record<string, Repository[] | undefined>
	>((acc, repository) => {
		const adminTeamSlugs = repositoriesToAdmins[repository.name] ?? [];
		const repo = asRepo(
			repository,
			repositoriesToAdmins[repository.name] ?? [],
		);

		adminTeamSlugs.forEach((adminSlug: string) => {
			if (acc[adminSlug] == undefined) {
				acc[adminSlug] = [repo];
			} else {
				acc[adminSlug]?.push(repo);
			}
		});

		return acc;
	}, {});

	const teamsOutput = teams.map((team): Team => {
		const repos = teamsMap[team.slug];

		return {
			id: team.id,
			name: team.name,
			slug: team.slug,
			repos: repos ?? [],
		};
	});

	return {
		teams: teamsOutput,
		repos: repositoriesOutput,
	};
}

export const main = async (): Promise<void> => {
	const config = await getConfig();
	configureLogging(getLogLevel(config.logLevel));

	console.log('Starting github-data-fetcher');

	const githubClient = getOctokit(config.github);
	const s3Client = getS3Client(config.region);

	const teamsAndRepos = await getTeamsAndRepositories(
		githubClient,
		config.github.teamToFetch,
	);

	const saveObject = async <T>(name: string, data: T) => {
		const repoFileLocation = path.join(config.dataKeyPrefix, `${name}.json`);
		await putObject(s3Client, config.dataBucketName, repoFileLocation, data);
	};

	await saveObject('repos', teamsAndRepos.repos);
	await saveObject('teams', teamsAndRepos.teams);

	console.log(`Finishing github-data-fetcher`);
};

if (require.main === module) {
	void (async () => await main())();
}
