import { createAppAuth } from '@octokit/auth-app';
import { throttling } from '@octokit/plugin-throttling';
import { Octokit } from '@octokit/rest';
import type { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import type { Config, Stage } from '../config';
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

const octokit = new Octokit();
export type RepositoriesResponse = GetResponseDataTypeFromEndpointMethod<
	typeof octokit.repos.listForOrg
>;
export type TeamsResponse = GetResponseDataTypeFromEndpointMethod<
	typeof octokit.teams.list
>;
export type SingleTeamResponse = GetResponseDataTypeFromEndpointMethod<
	typeof octokit.teams.getByName
>;
export type SingleRepoResponse = GetResponseDataTypeFromEndpointMethod<
	typeof octokit.repos.get
>;
export type TeamRepoResponse = GetResponseDataTypeFromEndpointMethod<
	typeof octokit.teams.listReposInOrg
>;
export type TeamRepoResponseAuth = GetResponseDataTypeFromEndpointMethod<
	typeof octokit.teams.listForAuthenticatedUser
>;
export type MembersInOrgResponse = GetResponseDataTypeFromEndpointMethod<
	typeof octokit.teams.listMembersInOrg
>;
export type RepositoryResponse = RepositoriesResponse[number];

let _octokit: Octokit | undefined;

export const getOctokit = (config: Config): Octokit => {
	if (_octokit) {
		return _octokit;
	}

	const credentials = config.github;

	_octokit = new ThrottledOctokit({
		authStrategy: createAppAuth,
		auth: {
			appId: credentials.appId,
			privateKey: credentials.appPrivateKey,
			installationId: credentials.appInstallationId,
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
			},
		},
	});

	return _octokit;
};

export const listRepositories = async (
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

export const getTeamlistForAuthenticatedUser = async (
	client: Octokit,
	teamSlug: string,
): Promise<TeamRepoResponseAuth> => {
	return await client.paginate(
		client.teams.listForAuthenticatedUser,
		{
			org: 'guardian',
			team_slug: teamSlug,
			per_page: defaultPageSize,
		},
		(response) => response.data,
	);
};

export const getTeamlistMembersInOrg = async (
	client: Octokit,
	teamSlug: string,
): Promise<MembersInOrgResponse> => {
	return await client.paginate(
		client.teams.listMembersInOrg,
		{
			org: 'guardian',
			team_slug: teamSlug,
			per_page: defaultPageSize,
		},
		(response) => response.data,
	);
};

export const getTeamBySlug = async (
	client: Octokit,
	teamSlug: string,
): Promise<SingleTeamResponse> => {
	const response = await client.teams.getByName({
		org: 'guardian',
		team_slug: teamSlug,
		per_page: defaultPageSize,
	});
	return response.data;
};

export const getInfoForRepo = async (
	client: Octokit,
	owner: string,
	repo: string,
): Promise<SingleRepoResponse> => {
	const response = await client.repos.get({
		org: 'guardian',
		owner: owner,
		repo: repo,
	});
	return response.data;
};

export const listTeamsForLocalDevelopment = async (
	client: Octokit,
): Promise<TeamsResponse> => {
	let teamCounter = 0;
	const numberOfTeams = 2;
	return await client.paginate(
		client.teams.list,
		{
			org: 'guardian',
			per_page: 1,
		},
		(response, done) => {
			teamCounter += response.data.length;
			if (teamCounter >= numberOfTeams) {
				done();
			}
			return response.data;
		},
	);
};

export const listRepositoriesForLocalDevelopment = async (
	client: Octokit,
): Promise<RepositoriesResponse> => {
	let repoCounter = 0;
	const numberOfRepos = 2;
	return await client.paginate(
		client.repos.listForOrg,
		{
			org: 'guardian',
			per_page: 1,
		},
		(response, done) => {
			repoCounter += response.data.length;
			if (repoCounter >= numberOfRepos) {
				done();
			}
			return response.data;
		},
	);
};

export const getReposForTeam = async (
	client: Octokit,
	teamSlug: string,
): Promise<TeamRepoResponse> => {
	return await client.paginate(
		client.teams.listReposInOrg,
		{
			org: 'guardian',
			team_slug: teamSlug,
			per_page: defaultPageSize,
		},
		(response) => response.data,
	);
};

//get everything after all but save to file in dir test only once on DEV

// export const getTeams = (stage: Stage, client: Octokit) => {
// 	return stage === 'DEV'
// 		? listTeamsForLocalDevelopment(client)
// 		: listTeams(client);
// };

export const getTeams = (stage: Stage, client: Octokit) => {
	return listTeams(client);
};

// export const getRepos = (stage: Stage, client: Octokit) => {
// 	return stage === 'DEV'
// 		? listRepositoriesForLocalDevelopment(client)
// 		: listRepositories(client);
// };

export const getRepos = (stage: Stage, client: Octokit) => {
	return listRepositories(client);
};
