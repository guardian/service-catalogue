import {
	getDatabaseConnectionString,
	getDevDatabaseConfig,
} from 'common/database';
import { config } from 'dotenv';
import { $ } from 'execa';

async function migrateDevDatabase(): Promise<number> {
	console.log('Performing a database migration in DEV');

	console.log('Loading .env file at the root of the repository');
	config({ path: `../../.env` });

	const dbConfig = await getDevDatabaseConfig();
	const connectionString = getDatabaseConnectionString(dbConfig);

	console.log('Setting DATABASE_URL');
	process.env.DATABASE_URL = connectionString;

	console.log('Running prisma migrate reset --force');
	const { stdout } = await $`npx -w common prisma migrate reset --force`;
	console.log(stdout);

	return Promise.resolve(0);
}

export async function migrateDatabase(stage: string): Promise<number> {
	switch (stage) {
		case 'DEV': {
			return migrateDevDatabase();
		}
		default: {
			throw new Error(`Unsupported stage: ${stage}`);
		}
	}
}
