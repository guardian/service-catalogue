import * as fs from 'fs';
import { readFileSync } from 'fs';
import { json as jsonBodyParser } from 'body-parser';
import cors from 'cors';
import type { Express } from 'express';
import express, { Router } from 'express';
import type { Config } from './config';
import { getRouteDescriptions } from './controller/describe';
import { getHealthCheckHandler } from './controller/healthcheck';

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

	app.engine('tmpl', (filePath, options, callback) => {
		fs.readFile(filePath, (err, content) => {
			if (err) return callback(err);
			// this is an extremely simple template engine
			const header = readFileSync(__dirname + '/views/header.tmpl');
			const footer = readFileSync(__dirname + '/views/footer.tmpl');
			let rendered = header.toString() + content.toString() + footer.toString();
			let title = 'Web Interface';
			const optionMap = new Map(Object.entries(options));
			if (optionMap.has('title')) {
				if (typeof optionMap.get('title') === 'string') {
					// only do this after checked for string
					// eslint-disable-next-line eslint-comments/require-description
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					title = optionMap.get('title');
				}
			}
			rendered = rendered.replace('#title#', title);
			console.log(optionMap);
			let message = '';
			if (optionMap.has('message')) {
				if (typeof optionMap.get('message') === 'string') {
					// only do this after checked for string
					// eslint-disable-next-line eslint-comments/require-description
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					message = optionMap.get('message');
				}
			}
			rendered = rendered.replace('#message#', message);
			return callback(null, rendered);
		});
	});

	app.set('views', __dirname + '/views'); // specify the views directory
	app.set('view engine', 'tmpl'); // register the template engine

	router.get('/service-catalogue', (req, res) => {
		res.render('service-catalogue', {
			title: 'Service Catalogue',
			message: 'Hello there!',
		});
	});

	//handle all invalid routes by showing all available routes
	router.get('*', getRouteDescriptions(router));

	app.use('/', router);

	return app;
}
