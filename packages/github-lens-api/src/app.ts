import { json as jsonBodyParser } from 'body-parser';
import type { RetrievedObject } from 'common/aws/s3';
import type { Repository } from 'common/github/github';
import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import asyncHandler from 'express-async-handler';

export function buildApp(
	repoData: Promise<RetrievedObject<Repository[]>>,
): Express {
	const app = express();

	app.use(jsonBodyParser());

	app.use(
		cors({
			origin: /\.(dev-)?gutools.co.uk$/,
			credentials: true,
		}),
	);

	app.get('/healthcheck', (req: express.Request, res: express.Response) => {
		res.status(200).json({ status: 'OK', stage: 'INFRA' });
	});

	app.get(
		'/repos',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			res.status(200).json(await repoData);
		}),
	);

	return app;
}
