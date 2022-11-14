import { json as jsonBodyParser } from 'body-parser';
import cors from 'cors';
import type { Express } from 'express';
import express, { Router } from 'express';
import { getDescribeRouterHandler } from '../../common/src/expressRoutes';

export function buildApp(): Express {
	const app = express();
	const router = Router();

	router.use(jsonBodyParser());

	router.use(
		cors({
			origin: /\.(dev-)?gutools.co.uk$/,
			credentials: true,
		}),
	);

	router.get('/healthcheck', (req: express.Request, res: express.Response) => {
		res.status(200).json({ status: 'OK', stage: 'INFRA' });
	});

	//handle all invalid routes by showing all available routes
	router.get('*', getDescribeRouterHandler(router));

	app.use('/', router);

	return app;
}
