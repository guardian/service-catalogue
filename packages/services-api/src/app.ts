import { json as jsonBodyParser } from 'body-parser';
import { getLocalS3Client, getS3Client } from 'common/aws/s3';
import cors from 'cors';
import type { Express } from 'express';
import express, { Router } from 'express';
import asyncHandler from 'express-async-handler';
import type { Config } from './config';
import { getRouteDescriptions } from './controller/describe';
import { getHealthCheckHandler } from './controller/healthcheck';
import type { GalaxyTeam } from './galaxies';
import { S3GalaxiesApi } from './galaxies';
import type { Service } from './services';
import { LensServicesApi } from './services';

interface TeamResponse extends GalaxyTeam {
	services: Service[];
}

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

	router.get('/healthcheck', getHealthCheckHandler());

	const client =
		config.stage !== 'DEV'
			? getS3Client('eu-west-1')
			: getLocalS3Client('eu-west-1', 'deployTools');

	// Note, this API does no caching of data atm. This is woefully inefficient
	// but we can improve this later!
	const galaxiesApi = new S3GalaxiesApi(client, config.galaxiesTmpBucket);

	const servicesApi = new LensServicesApi(
		config.cloudformationLensUrl,
		config.githubLensUrl,
	);

	// TODO include Cloudformation stacks for each team to get to MVP!

	router.get(
		'/teams',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const teams = await galaxiesApi.getTeams();
			const services = await servicesApi.list();
			const teamsWithServices = teams.map((team) => {
				const teamServices = services.filter((service) =>
					service.githubOwners.includes(team.primaryGithubTeam),
				);

				return { ...team, services: teamServices };
			});

			res.status(200).json(teamsWithServices);
		}),
	);

	router.get(
		'/teams/:id',
		asyncHandler(
			async (req: express.Request<{ id: string }>, res: express.Response) => {
				const team = await galaxiesApi.getTeam(req.params.id);
				const services = await servicesApi.forGithubOwner(
					team.primaryGithubTeam,
				);

				const resp: TeamResponse = { ...team, services };
				res.status(200).json(resp);
			},
		),
	);

	router.get(
		'/people',
		asyncHandler(async (req: express.Request, res: express.Response) => {
			const people = await galaxiesApi.getPeople();
			res.status(200).json(people);
		}),
	);

	//handle all invalid routes by showing all available routes
	router.get('*', getRouteDescriptions(router));

	app.use('/', router);

	return app;
}
