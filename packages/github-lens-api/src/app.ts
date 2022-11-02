import { json as jsonBodyParser } from 'body-parser';
import type { Repository } from 'common/github/github';
import cors from 'cors';
import type { Express } from 'express';
import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getDescribeRouterHandler } from './expressRoutes';

export function buildApp(repoData: Promise<Repository[]>): Express {
	const app = express();
	const router = Router();

	router.use(jsonBodyParser());

	router.use(
		cors({
			origin: /\.(dev-)?gutools.co.uk$/,
			credentials: true,
		}),
	);

	router.get('/', getDescribeRouterHandler(router));

	router.get('/healthcheck', (req: express.Request, res: express.Response) => {
		res.status(200).json({ status: 'OK', stage: 'INFRA' });
	});

	router.get(
		'/repos',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			res.status(200).json(await repoData);
		}),
	);

	app.use('/', router);

	return app;
}
