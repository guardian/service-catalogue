import path from 'path';
import type { S3Client } from '@aws-sdk/client-s3';
import type { Octokit } from '@octokit/rest';
import { getObject, getS3Client, putObject } from 'common/aws/s3';
import type { RepositoriesResponse } from 'common/github/github';
import {
	getLanguagesForRepositories,
	getLastCommitForRepositories,
	getOctokit,
	getReposForTeam,
	getReposFromGitHub,
	getTeam,
	listMembers,
	listTeamMembers,
	listTeams,
} from 'common/github/github';
import { configureLogging, getLogLevel } from 'common/log/log';
import type { Commit, Member, Repository, Team } from 'common/model/github';
import { getConfig } from './config';
import { isCachedRepositoryStale } from './repoMatching';
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

async function getReposFromS3(
	s3Client: S3Client,
	bucket: string,
	path: string,
): Promise<Repository[]> {
	const repos = await getObject<Repository[]>(s3Client, bucket, path);
	console.log(`Found ${repos.payload.length} repositories in S3`);
	return repos.payload;
}

async function getGHData(
	client: Octokit,
	unchangedRepos: Repository[],
	changedRepos: RepositoriesResponse,
	teamSlug?: string,
): Promise<TeamsAndRepositories> {
	// Get all teams
	const teams = teamSlug
		? [await getTeam(client, teamSlug)]
		: await listTeams(client);
	console.log(`Found ${teams.length} github teams`);

	// Get all repositories

	//TODO implement better way to test on dev
	//repositories = repositories.slice(0, 10);

	const orgMembers = await listMembers(client);
	console.log(`Found ${orgMembers.length} organisation members`);
	const teamSlugs = teams.map((_) => _.slug);

	// Join members to teams
	const membersOfTeams = await teamMembers(client, teamSlugs);
	const membersOutput: Member[] = orgMembers.map((member) =>
		asMember(member, membersOfTeams[member.login] ?? []),
	);
	console.log('Join members to teams');

	const repositoryLanguages: Record<string, string[]> =
		await getLanguagesForRepositories(client, changedRepos);

	const repositoryLastCommit: Record<string, Commit> =
		await getLastCommitForRepositories(client, changedRepos);

	// Join repositories to teams
	const repositoriesToAdmins = await teamRepositories(client, teamSlugs);
	const repositoriesOutput: Repository[] = changedRepos
		.map((repository) => {
			return asRepo(
				repository,
				repositoriesToAdmins[repository.name] ?? [],
				repositoryLanguages[repository.name] ?? [],
				repositoryLastCommit[repository.name],
			);
		})
		.concat(unchangedRepos);
	console.log(`${repositoriesOutput.length} repositories in output`);

	console.log('Join repositories to teams');
	const teamsMap: Record<string, Repository[] | undefined> =
		changedRepos.reduce<Record<string, Repository[] | undefined>>(
			(acc, repository) => {
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
			},
			{},
		);

	const teamsOutput: Team[] = teams.map((team): Team => {
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

	const oldRepos: Repository[] = await getReposFromS3(
		s3Client,
		config.dataBucketName,
		path.join(config.dataKeyPrefix, 'repos.json'),
	);
	const currentRepos: RepositoriesResponse = await getReposFromGitHub(
		githubClient,
	);
	console.log(`Found ${currentRepos.length} repositories on github`);

	const unchangedRepos: Repository[] = oldRepos.filter((oldRepo) =>
		isCachedRepositoryStale(oldRepo, currentRepos),
	);
	console.log(
		`${unchangedRepos.length} repositories are unchanged since the last successful run`,
	);

	const unchangedRepoNames = unchangedRepos.map((r) => r.name);

	const reposThatNeedUpdating: RepositoriesResponse = currentRepos.filter(
		(newRepo) => !unchangedRepoNames.includes(newRepo.name),
	);
	console.log(`${reposThatNeedUpdating.length} repositories have been updated`);

	const ghData = await getGHData(
		githubClient,
		unchangedRepos,
		reposThatNeedUpdating,
		config.github.teamToFetch,
	);

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
