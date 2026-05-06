import type { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { getDatabaseConnectionString } from 'common/src/database-setup.js';
import { $ } from 'execa';
import { getRdsConfig } from './aws.js';

/**
 * Performs a Prisma migration against the local database.
 *
 * It will:
 * 1. Reset the database, deleting all tables (and data)
 * 2. Apply all migrations to re-create all tables
 * 3. Update the schema.prisma file to reflect the database schema
 */
export async function migrateDevDatabase(): Promise<number> {
	console.log('Performing a database migration in DEV');

	console.log(
		'Fetching database connection details from .env file at the root of the repository',
	);

	console.log(`Running prisma migrate reset --force`);
	const { stdout } =
		await $`npx -w common prisma migrate reset --force --config prisma.config.ts --schema prisma/schema.prisma`;
	console.log(stdout);

	console.log('Running prisma db pull to update schema.prisma');
	const dbPull = await $`npx -w common prisma db pull`;
	console.log(dbPull.stdout);
	console.error(dbPull.stderr);

	return Promise.resolve(0);
}

export async function migrateRdsDatabase(
	stage: string,
	client: SecretsManagerClient,
	confirmed: boolean,
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

	if (!confirmed) {
		// See https://www.prisma.io/docs/reference/api-reference/command-reference#migrate-status
		console.log(`Running prisma migrate status`);
		const { stdout } = await $`npx -w common prisma migrate status`;
		console.log(stdout);

		console.log('If this looks correct, re-run with --confirm');
		return Promise.resolve(0);
	}

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

type ResolveState = 'rolled-back' | 'applied';

export async function resolveRdsMigration(
	stage: string,
	client: SecretsManagerClient,
	migration: string,
	state: ResolveState,
): Promise<number> {
	console.log(`Resolving migration in ${stage}: ${migration} (${state})`);

	const connectedToVpn = await isConnectedToVpn();
	if (!connectedToVpn) {
		throw new Error('Not connected to VPN');
	}

	console.log('Fetching database connection details from AWS Secrets Manager');
	const dbConfig = await getRdsConfig(client, stage);
	const connectionString = getDatabaseConnectionString(dbConfig);

	console.log('Setting Prisma env vars');
	process.env.STAGE = stage;
	process.env.DATABASE_HOSTNAME = dbConfig.hostname;
	process.env.DATABASE_USER = dbConfig.user;
	process.env.DATABASE_PASSWORD = dbConfig.password;

	console.log('Setting DATABASE_URL');
	process.env.DATABASE_URL = connectionString;

	const flag = state === 'rolled-back' ? '--rolled-back' : '--applied';

	console.log(`Running prisma migrate resolve ${flag} ${migration}`);
	const { stdout } =
		await $`npx -w common prisma migrate resolve ${flag} ${migration}`;
	console.log(stdout);

	return Promise.resolve(0);
}

async function isConnectedToVpn(): Promise<boolean> {
	console.log('Checking if connected to VPN');

	const { stdout } = await $`ifconfig`;
	const connected = stdout.includes('10.249.');
	return Promise.resolve(connected);
}
