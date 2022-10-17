import serverlessExpress from '@vendia/serverless-express';
import { config as dotEnvConfig } from 'dotenv';
import { buildApp } from './app';

dotEnvConfig();

const app = buildApp();

if (process.env.LOCAL === 'true') {
	const PORT = 3232;
	app.listen(PORT, () => {
		console.log(`Listening on port ${PORT}`);
		console.log(`Access via http://localhost:${PORT}`);
	});
}

export const main = serverlessExpress({ app });
