import { json as jsonBodyParser } from 'body-parser';
import cors from 'cors';
import express from 'express';
import type { Express } from 'express';

export function buildApp(): Express {
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

	app.get('/repos', (req: express.Request, res: express.Response) => {
		res.status(200).json({});
	});

	return app;
}
