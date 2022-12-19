import { createAppAuth } from '@octokit/auth-app';
import { throttling } from '@octokit/plugin-throttling';
import { Octokit } from '@octokit/rest';
import type { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import type { Commit } from 'common/model/github';
import { sleep } from '../sleep';

const ThrottledOctokit = Octokit.plugin(throttling);
const defaultPageSize = 100;

interface Options {
	method: string;
	url: string;
	request: {
		retryCount: number;
	};
}

export type GitHubConfig = {
	appId: string;
	appPrivateKey: string;
	appInstallationId: string;
	teamToFetch?: string;
};

const octokit = new Octokit();
export type RepositoriesResponse = GetResponseDataTypeFromEndpointMethod<
	typeof octokit.repos.listForOrg
>;
export type GetTeamByNameResponse = GetResponseDataTypeFromEndpointMethod<
	typeof octokit.teams.getByName
>;
export type TeamsResponse = GetResponseDataTypeFromEndpointMethod<
	typeof octokit.teams.list
>;
export type OrgMembersResponse = GetResponseDataTypeFromEndpointMethod<
	typeof octokit.orgs.listMembers
>;
export type TeamMembersResponse = GetResponseDataTypeFromEndpointMethod<
	typeof octokit.teams.listMembersInOrg
>;
export type MemberResponse = OrgMembersResponse[number];
export type TeamRepoResponse = GetResponseDataTypeFromEndpointMethod<
	typeof octokit.teams.listReposInOrg
>;
export type RepositoryResponse = RepositoriesResponse[number];

let _octokit: Octokit | undefined;

export const getOctokit = (config: GitHubConfig): Octokit => {
	if (_octokit) {
		return _octokit;
	}

	_octokit = new ThrottledOctokit({
		authStrategy: createAppAuth,
		auth: {
			appId: config.appId,
			privateKey: config.appPrivateKey,
			installationId: config.appInstallationId,
		},
		throttle: {
			onRateLimit: (retryAfter: number, options: Options) => {
				console.warn(
					`Request quota exhausted for request ${options.method} ${options.url}`,
				);

				// Retry twice after hitting a rate limit error, then give up
				if (options.request.retryCount <= 2) {
					console.log(`Retrying after ${retryAfter} seconds!`);
					return true;
				}

				return false;
			},
			onAbuseLimit: async (retryAfter: number, options: Options) => {
				// does not retry, only logs a warning
				console.warn(
					`Abuse detected for request ${options.method} ${options.url}`,
				);

				// Retry once after hitting a rate limit error, then give up
				if (options.request.retryCount <= 1) {
					console.log(`Retrying after 1 minute ${retryAfter} seconds!`);
					await sleep(60000);
					return true;
				}

				return false;
			},
		},
	});

	return _octokit;
};

export const getReposFromGitHub = async (
	client: Octokit,
): Promise<RepositoriesResponse> => {
	return await client.paginate(
		client.repos.listForOrg,
		{
			org: 'guardian',
			per_page: defaultPageSize,
		},
		(response) => response.data,
	);
};

export const getTeam = async (
	client: Octokit,
	teamName: string,
): Promise<GetTeamByNameResponse> => {
	const getTeamResponse = await client.teams.getByName({
		org: 'guardian',
		team_slug: teamName,
	});

	return getTeamResponse.data;
};

export const listTeams = async (client: Octokit): Promise<TeamsResponse> => {
	return await client.paginate(
		client.teams.list,
		{
			org: 'guardian',
			per_page: defaultPageSize,
		},
		(response) => response.data,
	);
};

export const listTeamMembers = async (
	client: Octokit,
	teamName: string,
): Promise<TeamMembersResponse> => {
	return await client.paginate(
		client.teams.listMembersInOrg,
		{
			org: 'guardian',
			team_slug: teamName,
		},
		(response) => response.data,
	);
};

export const listMembers = async (
	client: Octokit,
): Promise<OrgMembersResponse> => {
	return await client.paginate(
		client.orgs.listMembers,
		{
			org: 'guardian',
			per_page: defaultPageSize,
		},
		(response) => response.data,
	);
};

export const getReposForTeam = async (
	client: Octokit,
	teamName: string,
): Promise<TeamRepoResponse> => {
	return await client.paginate(
		client.teams.listReposInOrg,
		{
			org: 'guardian',
			team_slug: teamName,
			per_page: defaultPageSize,
		},
		(response) => response.data,
	);
};

export async function getLanguagesForRepositories(
	client: Octokit,
	repositories: RepositoriesResponse,
): Promise<Record<string, string[]>> {
	console.log('Get repo languages');
	const data = await Promise.all(
		repositories.map(async ({ name }) => {
			const languages = await getRepositoryLanguages(client, name);
			return {
				repository: name,
				languages,
			};
		}),
	);

	return data.reduce((acc, { repository, languages }) => {
		return {
			...acc,
			[repository]: languages,
		};
	}, {});
}

async function getRepositoryLanguages(
	client: Octokit,
	repositoryName: string,
): Promise<string[]> {
	const response = await client.repos.listLanguages({
		owner: 'guardian',
		repo: repositoryName,
	});
	const languages = Object.keys(response.data);
	console.debug(
		`Repository ${repositoryName} uses languages: ${languages.join(', ')}`,
	);
	return languages;
}

export async function getLastCommitForRepositories(
	client: Octokit,
	repositories: RepositoriesResponse,
): Promise<Record<string, Commit>> {
	console.log('Get last commits for repos');
	const data = await Promise.all(
		repositories
			.filter((repository) => {
				const repositoryIsEmpty = repository.size === 0;
				if (repositoryIsEmpty) {
					console.log(
						`Repository ${repository.name} is empty so there is also no last commit`,
					);
				}
				const hasDefaultBranch = repository.default_branch !== undefined;
				if (!hasDefaultBranch) {
					console.log(
						`Repository ${repository.name} has no default branch so there is also no last commit`,
					);
				}
				return hasDefaultBranch && !repositoryIsEmpty;
			})
			.map(async ({ name, default_branch }) => {
				const lastCommits = await getRepositoryLastCommit(
					client,
					name,
					default_branch!,
				);
				return {
					repository: name,
					lastCommits,
				};
			}),
	);

	return data.reduce((acc, { repository, lastCommits }) => {
		return {
			...acc,
			[repository]: lastCommits,
		};
	}, {});
}

async function getRepositoryLastCommit(
	client: Octokit,
	repositoryName: string,
	defaultBranch: string,
): Promise<Commit | undefined> {
	const response = await client.repos.getCommit({
		owner: 'guardian',
		repo: repositoryName,
		per_page: 1,
		ref: defaultBranch,
	});
	const lastCommit = response.data;
	return {
		message: lastCommit.commit.message,
		author: lastCommit.commit.author?.name,
		date: lastCommit.commit.author?.date,
		sha: lastCommit.sha,
	};
}
