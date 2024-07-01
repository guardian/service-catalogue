import type { Endpoints } from '@octokit/types';

export type PullRequestParameters =
	Endpoints['GET /repos/{owner}/{repo}/pulls']['parameters'];

export type PullRequest =
	Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'][number];

export type StatusCode = number;
