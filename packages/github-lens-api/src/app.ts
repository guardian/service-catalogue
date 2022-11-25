import { json as jsonBodyParser } from 'body-parser';
import type { RetrievedObject } from 'common/aws/s3';
import type { Repository, Team } from 'common/model/github';
import cors from 'cors';
import type { Express } from 'express';
import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getDescribeRouterHandler } from '../../common/src/expressRoutes';

export function buildApp(
	repoData: Promise<RetrievedObject<Repository[]>>,
	teamData: Promise<RetrievedObject<Team[]>>,
): Express {
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

	router.get(
		'/repos',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const reposData = await repoData;
			if (typeof req.query.name !== 'undefined') {
				const searchString:string = req.query.name.toString()
				const jsonResponse = reposData.payload.filter((item) =>
					item.name.match(searchString),
				);
				if (jsonResponse.length !== 0) {
					res.status(200).json(jsonResponse);
				} else {
					res
						.status(200)
						.json({ searchString: searchString, info: 'no results found in repos' });
				}			} else {
				res.status(200).json(reposData);
			}
		}),
	);

	router.get(
		'/repos/:name',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const reposData = await repoData;
			const jsonResponse = reposData.payload.filter(
				(item) => item.name === req.params.name,
			);
			if (jsonResponse.length !== 0) {
				res.status(200).json(jsonResponse);
			} else {
				res
					.status(200)
					.json({ repoName: req.params.name, info: 'Repo not found' });
			}
		}),
	);

	router.get(
		'/teams',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const teamsData = await teamData;
			res.status(200).json(teamsData);
		}),
	);

	router.get(
		'/teams/:name',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const teamsData = await teamData;
			const jsonResponse = teamsData.payload.filter(
				(item) => item.slug === req.params.name,
			);
			if (jsonResponse.length !== 0) {
				res.status(200).json(jsonResponse);
			} else {
				res
					.status(200)
					.json({ repoName: req.params.name, info: 'Team not found' });
			}
		}),
	);

	//handle all invalid routes by showing all available routes
	router.get('*', getDescribeRouterHandler(router, (path: string) => {
		let info = '';
		switch (path) {
			case '/healthcheck':
				info = 'Display healthcheck';
				break;
			case '/repos':
				info =
					'Show all repos, with their team owners, optionally search by name with ?name=^repo-name-regex.*';
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
		return info;
	}));

	app.use('/', router);

	return app;
}
