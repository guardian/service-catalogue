import { json as jsonBodyParser } from 'body-parser';
import cors from 'cors';
import type { Express } from 'express';
import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getRouteDescriptions } from './controller/DescribeApiController';
import { getHealthCheckHandler } from './controller/HealthCheckController';
import { getMembers, getMembersByLogin } from './controller/MembersController';
import { getAllRepos, getRepoByName } from './controller/ReposController';
import { getTeamBySlug } from './controller/TeamsController';
import type { GitHubData } from './data';

export function buildApp(ghData: Promise<GitHubData>): Express {
	const app = express();
	const router = Router();

	router.use(jsonBodyParser());

	router.use(
		cors({
			origin: /\.(dev-)?gutools.co.uk$/,
			credentials: true,
		}),
	);

	router.get('/healthcheck', getHealthCheckHandler());

	router.get(
		'/repos',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const reposData = (await ghData).repos;
			if (reposData === undefined) {
				res.status(500).json({ error: 'Unable to retrieve repository data!' });
				return;
			}
			getAllRepos(req, res, reposData);
		}),
	);

	router.get(
		'/repos/:name',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const reposData = (await ghData).repos;
			if (reposData === undefined) {
				res.status(500).json({ error: 'Unable to retrieve repository data!' });
				return;
			}
			getRepoByName(req, res, reposData);
		}),
	);

	router.get(
		'/teams',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const teamsData = (await ghData).teams;
			if (teamsData === undefined) {
				res.status(500).json({ error: 'Unable to retrieve teams data!' });
				return;
			}
			res.status(200).json(teamsData);
		}),
	);

	router.get(
		'/teams/:slug',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const teamsData = (await ghData).teams;
			if (teamsData === undefined) {
				res.status(500).json({ error: 'Unable to retrieve teams data!' });
				return;
			}
			getTeamBySlug(req, res, teamsData);
		}),
	);

	router.get(
		'/members',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const membersData = (await ghData).members;
			if (membersData === undefined) {
				res.status(500).json({ error: 'Unable to retrieve members data!' });
				return;
			}
			getMembers(req, res, membersData);
		}),
	);

	router.get(
		'/members/:login',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const membersData = (await ghData).members;
			if (membersData === undefined) {
				res.status(500).json({ error: 'Unable to retrieve members data!' });
				return;
			}
			getMembersByLogin(req, res, membersData);
		}),
	);

	//handle all invalid routes by showing all available routes
	router.get('*', getRouteDescriptions(router));

	app.use('/', router);

	return app;
}
