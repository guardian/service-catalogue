import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

if (process.env.STAGE !== 'PROD' && process.env.STAGE !== 'CODE') {
	config({ path: `../../.env` });
}

export default defineConfig({
	schema: path.join('prisma', 'schema.prisma'),
	datasource: {
		url: env('DATABASE_URL'),
	},
	migrations: {
		path: path.join('prisma', 'migrations'),
	},
	views: {
		path: path.join('prisma', 'views'),
	},
});
