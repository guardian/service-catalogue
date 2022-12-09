import { getDescribeRouterHandler } from 'common/expressRoutes';
import type { Router } from 'express';

function describeRoutes(path: string): string {
	const infoByRoute: Record<string, string> = {
		'/healthcheck': 'Display healthcheck',
		'/teams': 'Show all P&E teams, with the services they own',
		'/teams/:id': 'Show team and the services it owns, if it exists',
		'/people': 'Show all P&E people, with their role & GitHub username',
		'/members/:login': 'Show member and the teams they are in, if it exists',
	};

	return infoByRoute[path] ?? 'No path info supplied';
}

export const getRouteDescriptions = (router: Router) => {
	return getDescribeRouterHandler(router, describeRoutes);
};
