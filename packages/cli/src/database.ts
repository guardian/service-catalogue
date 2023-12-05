import type { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import {
	getDatabaseConnectionString,
	getDevDatabaseConfig,
} from 'common/database';
import { config } from 'dotenv';
import { $ } from 'execa';
import { getRdsConfig } from './aws';

export async function migrateDevDatabase(): Promise<number> {
	console.log('Performing a database migration in DEV');

	console.log(
		'Fetching database connection details from .env file at the root of the repository',
	);
	config({ path: `../../.env` });
	const dbConfig = await getDevDatabaseConfig();
	const connectionString = getDatabaseConnectionString(dbConfig);

	console.log('Setting DATABASE_URL');
	process.env.DATABASE_URL = connectionString;

	console.log(`Running prisma migrate reset --force`);
	const { stdout } = await $`npx -w common prisma migrate reset --force`;
	console.log(stdout);

	return Promise.resolve(0);
}

export async function migrateRdsDatabase(
	stage: string,
	client: SecretsManagerClient,
	fromStart: boolean,
): Promise<number> {
	console.log(
		`Performing a database migration in ${stage} fromStart=${fromStart.toString()}`,
	);

	const connectedToVpn = await isConnectedToVpn();

	if (!connectedToVpn) {
		throw new Error('Not connected to VPN');
	}

	console.log('Fetching database connection details from AWS Secrets Manager');
	const dbConfig = await getRdsConfig(client, stage);
	const connectionString = getDatabaseConnectionString(dbConfig);

	console.log('Setting DATABASE_URL');
	process.env.DATABASE_URL = connectionString;

	if (fromStart) {
		console.log(`Running prisma migrate resolve --applied 0_init`);
		const { stdout } =
			await $`npx -w common prisma migrate resolve --applied 0_init`;
		console.log(stdout);
	}

	console.log(`Running prisma migrate deploy`);
	const { stdout } = await $`npx -w common prisma migrate deploy`;
	console.log(stdout);

	return Promise.resolve(0);
}

async function isConnectedToVpn(): Promise<boolean> {
	console.log('Checking if connected to VPN');

	const { stdout } = await $`ifconfig`;
	const connected = stdout.includes('10.249.');
	return Promise.resolve(connected);
}
