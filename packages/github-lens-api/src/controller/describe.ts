import { getDescribeRouterHandler } from 'common/expressRoutes';
import type { Router } from 'express';

function describeRoutes(path: string): string {
	const infoByRoute: Record<string, string> = {
		'/healthcheck': 'Display healthcheck',
		'/repos':
			'Show all repos, with their team owners, optionally filter repositories ?repoName=^repo-name-regex.*, ?repoIsArchived, ?repoIsNotArchived, ?repoNotOwned',
		'/repos/:name': 'Show repo and its team owners, if it exists',
		'/teams':
			'Show all teams, with the repositories they own, optionally filter repositories ?repoName=^repo-name-regex.*, ?repoIsArchived, ?repoIsNotArchived, ?teamIsEngineering, ?teamIsValid',
		'/teams/:slug':
			'Show team with info, if it exists, optionally filter repositories ?repoName=^repo-name-regex.*, ?repoIsArchived, ?repoIsNotArchived, ?teamIsEngineering, ?teamIsValid',
		'/members': 'Show member, with the teams they are in',
		'/members/:login': 'Show member and the teams they are in, if it exists',
	};

	return infoByRoute[path] ?? 'No path info supplied';
}

export const getRouteDescriptions = (router: Router) => {
	return getDescribeRouterHandler(router, describeRoutes);
};
