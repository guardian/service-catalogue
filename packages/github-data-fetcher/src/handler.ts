import path from 'path';
import type { Octokit } from '@octokit/rest';
import { getS3Client, putObject } from 'common/aws/s3';
import {
	getLanguagesForRepositories,
	getLastCommitForRepositories,
	getOctokit,
	getReposForTeam,
	getTeam,
	listMembers,
	listRepositories,
	listTeamMembers,
	listTeams,
} from 'common/github/github';
import { configureLogging, getLogLevel } from 'common/log/log';
import type { Member, Repository, Team } from 'common/model/github';
import { getConfig } from './config';
import { asMember, asRepo, getAdminReposFromResponse } from './transformations';

// Returns a map of repoName -> admins (a list of team slugs).
const teamRepositories = async (
	client: Octokit,
	teamSlugs: string[],
): Promise<Record<string, string[] | undefined>> => {
	const teamRepositories = teamSlugs.map(async (teamName) => {
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

// Returns a map of memberName -> teamNames.
const teamMembers = async (
	client: Octokit,
	teamSlugs: string[],
): Promise<Record<string, string[] | undefined>> => {
	const memberTeams = teamSlugs.map(async (teamSlug) => {
		const teamMembers = await listTeamMembers(client, teamSlug);
		return teamMembers.map((member) => ({
			login: member.login,
			teamSlug,
		}));
	});

	const flattened = (await Promise.all(memberTeams)).flat();

	return flattened.reduce<Record<string, string[] | undefined>>(
		(acc, member) => {
			const existing = acc[member.login] ?? [];
			acc[member.login] = existing.concat(member.teamSlug);
			return acc;
		},
		{},
	);
};

export interface TeamsAndRepositories {
	teams: Team[];
	repos: Repository[];
	members: Member[];
}

async function getGHData(
	client: Octokit,
	teamSlug?: string,
): Promise<TeamsAndRepositories> {
	// Get all teams
	const teams = teamSlug
		? [await getTeam(client, teamSlug)]
		: await listTeams(client);
	console.log(`Found ${teams.length} github teams`);

	// Get all repositories
	let repositories = await listRepositories(client);

	//TODO implement better way to test on dev
	//repositories = repositories.slice(0, 10);

	console.log(`Found ${repositories.length} github repos`);

	// Get all organisation members
	const members = await listMembers(client);
	console.log(`Found ${members.length} organisation members`);

	const teamSlugs = teams.map((_) => _.slug);

	// Join members to teams
	const membersOfTeams = await teamMembers(client, teamSlugs);
	const membersOutput = members.map((member) =>
		asMember(member, membersOfTeams[member.login] ?? []),
	);
	console.log('Join members to teams');

	const repositoryLanguages = await getLanguagesForRepositories(
		client,
		repositories,
	);
	console.log('Get repo languages');

	const repositoryLastCommit = await getLastCommitForRepositories(
		client,
		repositories,
	);
	console.log('Get last commits for repos');

	// Join repositories to teams
	const repositoriesToAdmins = await teamRepositories(client, teamSlugs);
	const repositoriesOutput = repositories.map((repository) => {
		return asRepo(
			repository,
			repositoriesToAdmins[repository.name] ?? [],
			repositoryLanguages[repository.name] ?? [],
			repositoryLastCommit[repository.name],
		);
	});
	console.log('Join repositories to teams');

	const teamsMap = repositories.reduce<
		Record<string, Repository[] | undefined>
	>((acc, repository) => {
		const adminTeamSlugs = repositoriesToAdmins[repository.name] ?? [];
		const repo = asRepo(
			repository,
			repositoriesToAdmins[repository.name] ?? [],
			repositoryLanguages[repository.name] ?? [],
			repositoryLastCommit[repository.name],
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
		members: membersOutput,
	};
}

export const main = async (): Promise<void> => {
	const config = await getConfig();
	configureLogging(getLogLevel(config.logLevel));

	console.log('Starting github-data-fetcher');

	const githubClient = getOctokit(config.github);
	const s3Client = getS3Client(config.region);

	const ghData = await getGHData(githubClient, config.github.teamToFetch);

	const saveObject = async <T>(name: string, data: T) => {
		const repoFileLocation = path.join(config.dataKeyPrefix, `${name}.json`);
		await putObject(s3Client, config.dataBucketName, repoFileLocation, data);
	};

	await saveObject('repos', ghData.repos);
	await saveObject('teams', ghData.teams);
	await saveObject('members', ghData.members);

	console.log(`Finishing github-data-fetcher`);
};

if (require.main === module) {
	void (async () => await main())();
}
