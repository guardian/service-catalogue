import path from 'path';
import type { S3Client } from '@aws-sdk/client-s3';
import type { Octokit } from '@octokit/rest';
import { getObject, getS3Client, putObject } from 'common/aws/s3';
import type {
	RepositoriesResponse,
	RepositoryResponse,
} from 'common/github/github';
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
	S3client: S3Client,
	bucket: string,
	path: string,
): Promise<Repository[]> {
	const repos = await getObject<Repository[]>(S3client, bucket, path);
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
	console.log(`Found ${changedRepos.length} modified or new github repos`);

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
	console.log('Join repositories to teams');

	const teamsMap = changedRepos.reduce<
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

	function timestampsMatch(
		oldRepo: Repository,
		newRepo: RepositoryResponse,
	): boolean {
		if (newRepo.updated_at && newRepo.pushed_at) {
			const matchingUpdateTime =
				new Date(newRepo.updated_at) === oldRepo.updated_at;
			const matchingPushTime =
				new Date(newRepo.pushed_at) === oldRepo.pushed_at;
			return matchingPushTime && matchingUpdateTime;
		} else {
			return false;
		}
	}

	function foundUnchangedMatchOnGithub(
		oldRepo: Repository,
		newRepos: RepositoriesResponse,
	): boolean {
		const matchingRepo: RepositoryResponse | undefined = newRepos.find(
			(newRepo) => newRepo.name === oldRepo.name,
		);
		if (matchingRepo) {
			return timestampsMatch(oldRepo, matchingRepo);
		} else {
			return false;
		}
	}

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

	const unchangedRepos: Repository[] = oldRepos.filter((oldRepo) =>
		foundUnchangedMatchOnGithub(oldRepo, currentRepos),
	);

	const reposThatNeedUpdating: RepositoriesResponse = currentRepos.filter(
		(newRepo) => !unchangedRepos.map((r) => r.name).includes(newRepo.name),
	);

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
