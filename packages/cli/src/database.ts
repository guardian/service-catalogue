import { $ } from 'execa';

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
