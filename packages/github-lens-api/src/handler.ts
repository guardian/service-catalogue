import serverlessExpress from '@vendia/serverless-express';
import { configureLogging, getLogLevel } from 'common/log/log';
import { buildApp } from './app';
import { getConfig } from './config';

const config = getConfig();

configureLogging(config.logLevel);

const app = buildApp(config);

if (process.env.LOCAL === 'true') {
	const PORT = 3232;
	app.listen(PORT, () => {
		console.log(`Listening on port ${PORT}`);
		console.log(`Access via http://localhost:${PORT}`);
	});
}

export const main = serverlessExpress({ app });
