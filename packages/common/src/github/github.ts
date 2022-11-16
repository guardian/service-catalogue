import { createAppAuth } from '@octokit/auth-app';
import { throttling } from '@octokit/plugin-throttling';
import { Octokit } from '@octokit/rest';
import type { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
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
export type TeamsResponse = GetResponseDataTypeFromEndpointMethod<
	typeof octokit.teams.list
>;
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
