import type { Router } from 'express';
import type express from 'express';

interface InnerLayer {
	method: string;
}

interface InnerRoute {
	path: string;
	stack: InnerLayer[];
}

interface RouterLayer {
	route: InnerRoute | undefined;
}

export const getDescribeRouterHandler = (router: Router) => {
	return (req: express.Request, res: express.Response) => {
		const urlProtocol = req.protocol + '://';
		const urlHost = req.get('host') ?? 'localhost:3232';
		const stack = router.stack
			.filter(
				(layer: RouterLayer) =>
					layer.route != undefined && layer.route.path !== '*',
			)
			.map((layer: RouterLayer) => {
				const path = layer.route?.path ?? '';
				let info = '';
				switch (path) {
					case '/healthcheck':
						info = 'Display healthcheck';
						break;
					case '/repos':
						info =
							'Show all repos, with their team owners';
						break;
					case '/repos/:name':
						info = 'Show repo and its team owners, if it exists';
						break;
					case '/teams':
						info =
							'Show all teams, with the repositories they own';
						break;
					case '/teams/:name':
						info = 'Show team and the repositories it owns, if it exists';
						break;
					default:
						info = 'No path info supplied';
						break;
				}
				return {
					path: urlProtocol + urlHost + path,
					methods: layer.route?.stack.map((innerStack) => innerStack.method),
					info: info,
				};
			});

		res.status(404).json(stack);
	};
};
