import { getDescribeRouterHandler } from 'common/expressRoutes';
import type { Router } from 'express';

function describeRoutes(path: string) {
	let info = '';
	switch (path) {
		case '/healthcheck':
			info = 'Display healthcheck';
			break;
		case '/repos':
			info =
				'Show all repos, with their team owners, optionally search by name with ?name=^repo-name-regex.*';
			break;
		case '/repos/:name':
			info = 'Show repo and its team owners, if it exists';
			break;
		case '/archivedRepos':
			info = 'Show all archived repos';
			break;
		case '/archivedReposNamesOnly':
			info = 'Show all archived repos, names only (for tracker)';
			break;
		case '/teams':
			info = 'Show all teams, with the repositories they own';
			break;
		case '/teams/:slug':
			info = 'Show team and the repositories it owns, if it exists';
			break;
		case '/members':
			info = 'Show member, with the teams they are in';
			break;
		case '/members/:login':
			info = 'Show member and the teams they are in, if it exists';
			break;
		default:
			info = 'No path info supplied';
			break;
	}
	return info;
}

export const getRouteDescriptions = (router: Router) => {
	return getDescribeRouterHandler(router, describeRoutes);
};
