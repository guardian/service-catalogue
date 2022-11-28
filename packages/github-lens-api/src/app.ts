import { json as jsonBodyParser } from 'body-parser';
import cors from 'cors';
import type { Express } from 'express';
import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getDescribeRouterHandler } from '../../common/src/expressRoutes';
import type { GitHubData } from './data'

export function buildApp(
	ghData: Promise<GitHubData>,
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
			const reposData = (await ghData).repos;
			if (reposData === undefined) {
				res.status(500).json({ error: 'Unable to retrieve repository data!'});
				return;
			}

			if (typeof req.query.name !== 'undefined') {
				const searchString: string = req.query.name.toString()
				const jsonResponse = reposData.payload.filter((item) =>
					item.name.match(searchString),
				);
				if (jsonResponse.length !== 0) {
					res.status(200).json(jsonResponse);
				} else {
					res
						.status(200)
						.json({ searchString: searchString, info: 'no results found in repos' });
				}			
			} else {
				res.status(200).json(reposData);
			}
		}),
	);

	router.get(
		'/repos/:name',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const reposData = (await ghData).repos;
			if (reposData === undefined) {
				res.status(500).json({ error: 'Unable to retrieve repository data!'});
				return;
			}

			const jsonResponse = reposData.payload.find(
				(item) => item.name === req.params.name,
			);
			if (jsonResponse !== undefined) {
				res.status(200).json(jsonResponse);
			} else {
				res
					.status(200)
					.json({ repoName: req.params.name, info: 'Repository not found' });
			}
		}),
	);

	router.get(
		'/teams',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const teamsData = (await ghData).teams;
			if (teamsData === undefined) {
				res.status(500).json({ error: 'Unable to retrieve teams data!'});
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
				res.status(500).json({ error: 'Unable to retrieve teams data!'});
				return;
			}

			const jsonResponse = teamsData.payload.find(
				(item) => item.slug === req.params.slug,
			);
			if (jsonResponse !== undefined) {
				res.status(200).json(jsonResponse);
			} else {
				res
					.status(200)
					.json({ teamSlug: req.params.slug, info: 'Team not found' });
			}
		}),
	);

	router.get(
		'/members',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const membersData = (await ghData).members;
			if (membersData === undefined) {
				res.status(500).json({ error: 'Unable to retrieve members data!'});
				return;
			}

			res.status(200).json(membersData);
		}),
	);

	router.get(
		'/members/:login',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const membersData = (await ghData).members;
			if (membersData === undefined) {
				res.status(500).json({ error: 'Unable to retrieve members data!'});
				return;
			}

			const jsonResponse = membersData.payload.find(
				(item) => item.login === req.params.login,
			);
			if (jsonResponse !== undefined) {
				res.status(200).json(jsonResponse);
			} else {
				res
					.status(200)
					.json({ memberLogin: req.params.login, info: 'Member not found' });
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
			case '/teams/:slug':
				info = 'Show team and the repositories it owns, if it exists';
				break;
			case '/members':
				info =
					'Show member, with the teams they are in';
				break;
			case '/members/:login':
				info = 'Show member and the teams they are in, if it exists';
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
