import { json as jsonBodyParser } from 'body-parser';
import { getLocalS3Client, getS3Client } from 'common/aws/s3';
import cors from 'cors';
import type { Express } from 'express';
import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getDescribeRouterHandler } from '../../common/src/expressRoutes';
import type { Config } from './config';
import { S3GalaxiesApi } from './galaxies';

export function buildApp(config: Config): Express {
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

	const client =
		config.stage !== 'DEV'
			? getS3Client('eu-west-1')
			: getLocalS3Client('eu-west-1', 'deployTools');

	// Note, this API does no caching of data atm. This is woefully inefficient
	// but we can improve this later!
	const galaxiesApi = new S3GalaxiesApi(client, config.galaxiesTmpBucket);

	// TODO include Cloudformation stacks for each team to get to MVP!

	router.get(
		'/teams',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const teams = await galaxiesApi.getTeams();
			res.status(200).json(teams);
		}),
	);

	router.get(
		'/teams/:id',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const team = await galaxiesApi.getTeam(req.params.id);
			res.status(200).json(team);
		}),
	);

	router.get(
		'/people',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const people = await galaxiesApi.getPeople();
			res.status(200).json(people);
		}),
	);

	//handle all invalid routes by showing all available routes
	router.get('*', getDescribeRouterHandler(router));

	app.use('/', router);

	return app;
}
