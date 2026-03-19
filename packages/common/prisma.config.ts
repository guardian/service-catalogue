import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';
import { getDatabaseConnectionString } from 'common/src/database-setup.js';

if (process.env.STAGE !== 'PROD' && process.env.STAGE !== 'CODE') {
	config({ path: `../../.env` });
}

export default defineConfig({
	schema: path.join('prisma', 'schema.prisma'),
	datasource: {
		url: getDatabaseConnectionString({
			hostname: process.env.DATABASE_HOSTNAME as string,
			user: process.env.DATABASE_USER as string,
			password: process.env.DATABASE_PASSWORD as string,
		}),
	},
	migrations: {
		path: path.join('prisma', 'migrations'),
	},
	views: {
		path: path.join('prisma', 'views'),
	},
});
