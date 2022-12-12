import { getDescribeRouterHandler } from 'common/expressRoutes';
import type { Router } from 'express';

function describeRoutes(path: string): string {
	const infoByRoute: Record<string, string> = {
		'/healthcheck': 'Display healthcheck',
		'/service-catalogue':
			'Web Interface for data provided by service catalogue apis',
	};

	return infoByRoute[path] ?? 'No path info supplied';
}

export const getRouteDescriptions = (router: Router) => {
	return getDescribeRouterHandler(router, describeRoutes);
};
