import path from 'path';
import { json as jsonBodyParser } from 'body-parser';
import { getObject, getS3Client } from 'common/aws/s3';
import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import asyncHandler from 'express-async-handler';
import type { Config } from './config';

export function buildApp(config: Config): Express {
	const app = express();
	const s3Client = getS3Client(config.region);

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
			const repoFileLocation = path.join(config.dataKeyPrefix, 'repos.json');
			const data = await getObject(
				s3Client,
				config.dataBucketName,
				repoFileLocation,
			);

			res.status(200).json(data);
		}),
	);

	return app;
}
