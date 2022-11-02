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
		const stack = router.stack
			.filter((layer: RouterLayer) => layer.route != undefined)
			.map((layer: RouterLayer) => {
				return {
					path: layer.route?.path,
					methods: layer.route?.stack.map((innerStack) => innerStack.method),
				};
			});

		res.status(200).json(stack);
	};
}
