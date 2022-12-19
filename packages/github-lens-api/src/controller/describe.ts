import { getDescribeRouterHandler } from 'common/expressRoutes';
import type { Router } from 'express';
import { repoFilters, teamFilters } from '../filters';

function describeRoutes(path: string): string {
	const availableRepoFilters = repoFilters.map((_) => _.paramName).join(', ');
	const availableTeamFilters = [
		availableRepoFilters,
		teamFilters.map((_) => _.paramName),
	]
		.flat()
		.join(', ');

	const infoByRoute: Record<string, string> = {
		'/healthcheck': 'Display healthcheck',
		'/repos': `Show all repos, with their team owners. Available filters (applied as query strings): ${availableRepoFilters}`,
		'/repos/:name': 'Show repo and its team owners, if it exists',
		'/teams': `Show all teams, with the repositories they own. Available filters (applied as query strings): ${availableTeamFilters}`,
		'/teams/:slug': `Show team with info, if it exists. Available filters (applied as query strings): ${availableTeamFilters}`,
		'/members': 'Show member, with the teams they are in',
		'/members/:login': 'Show member and the teams they are in, if it exists',
	};

	return infoByRoute[path] ?? 'No path info supplied';
}

export const getRouteDescriptions = (router: Router) => {
	return getDescribeRouterHandler(router, describeRoutes);
};
