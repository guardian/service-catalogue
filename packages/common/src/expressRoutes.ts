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

export const getDescribeRouterHandler = (router: Router, describeRoutes: (path: string) => string) => {
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
				const info = describeRoutes(path);
				
				return {
					path: urlProtocol + urlHost + path,
					methods: layer.route?.stack.map((innerStack) => innerStack.method),
					info: info,
				};
			});

		res.status(404).json(stack);
	};
};
