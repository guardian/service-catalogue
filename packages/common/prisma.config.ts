import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
	schema: path.join('prisma', 'schema.prisma'),
	datasource: {
		url: { fromEnvVar: 'DATABASE_URL' },
	},
	migrations: {
		path: path.join('prisma', 'migrations'),
	},
	views: {
		path: path.join('prisma', 'views'),
	},
});
