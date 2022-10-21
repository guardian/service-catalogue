import fs, { read, readFileSync } from 'fs';
import { join } from 'path';
import { json as jsonBodyParser } from 'body-parser';
import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import { validGithubTeams } from './validGithubTeams';

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

	const localJsonFilesCreatedFileName = join(
		__dirname,
		'../../../test/localJsonFilesCreated',
	);

	if (fs.existsSync(localJsonFilesCreatedFileName)) {
		app.get('/', (req: express.Request, res: express.Response) => {
			res.status(200).json([
				{
					endpoint: 'healthcheck',
					info: 'check if API is responding',
					testlink: 'http://localhost:3232/healthcheck',
				},
				{
					endpoint: 'validGithubTeams',
					info: 'all valid github teams',
					testlink: 'http://localhost:3232/validGithubTeams',
				},
				{
					endpoint: 'repos',
					info: 'all Guardian repos',
					testlink: 'http://localhost:3232/repos',
				},
				{
					endpoint: 'reposAndOwnersDev',
					info: 'all devX repos',
					testlink: 'http://localhost:3232/reposAndOwnersDev',
				},
				{
					endpoint: 'riffraff',
					info: 'info about riffraff repo',
					testlink: 'http://localhost:3232/riffraff',
				},
			]);
		});

		const repos = readFileSync(
			join(__dirname, '../../../test/repos.json'),
			'utf8',
		);

		app.get('/repos', (req: express.Request, res: express.Response) => {
			res.status(200).json(JSON.parse(repos));
		});

		const reposAndOwnersDev = readFileSync(
			join(__dirname, '../../../test/reposAndOwnersDev.json'),
			'utf8',
		);

		app.get(
			'/reposAndOwnersDev',
			(req: express.Request, res: express.Response) => {
				res.status(200).json(JSON.parse(reposAndOwnersDev));
			},
		);

		app.get(
			'/validGithubTeams',
			(req: express.Request, res: express.Response) => {
				res.status(200).json(validGithubTeams);
			},
		);

		const riffraff = readFileSync(
			join(__dirname, '../../../test/repoRiffRaff.json'),
			'utf8',
		);

		app.get('/riffraff', (req: express.Request, res: express.Response) => {
			res.status(200).json(JSON.parse(riffraff));
		});
	}

	return app;
}
