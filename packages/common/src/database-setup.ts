import { Signer } from '@aws-sdk/rds-signer';
import { PrismaPg } from '@prisma/adapter-pg';
import { awsClientConfig } from 'common/aws.js';
import { getEnvOrThrow } from 'common/functions.js';
import { PrismaClient } from 'common/prisma-client/client.js';
import { config } from 'dotenv';

export interface DatabaseConfig {
	/**
	 * The hostname of the database.
	 */
	hostname: string;

	/**
	 * The database user.
	 */
	user: string;

	/**
	 * The database password for the provided user.
	 */
	password: string;
}

export interface PrismaConfig {
	/**
	 * The database connection string.
	 */
	databaseConnectionString: string;

	/**
	 * Whether to configure Prisma to log the SQL queries being executed.
	 *
	 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/logging
	 */
	withQueryLogging: boolean;
}

const databasePort = 5432;

async function getRdsToken(stage: string, hostname: string, username: string) {
	console.log('Generating RDS token');

	const signer = new Signer({
		hostname,
		port: databasePort,
		username,
		...awsClientConfig(stage),
	});

	return await signer.getAuthToken();
}

export function getDevDatabaseConfig(): Promise<DatabaseConfig> {
	config({ path: `../../.env` });

	return Promise.resolve({
		hostname: getEnvOrThrow('DATABASE_HOSTNAME'),
		user: getEnvOrThrow('DATABASE_USER'),
		password: getEnvOrThrow('DATABASE_PASSWORD'),
	});
}

export async function getDatabaseConfig(
	stage: string,
	user: string,
): Promise<DatabaseConfig> {
	const hostname = getEnvOrThrow('DATABASE_HOSTNAME');
	const password = await getRdsToken(stage, hostname, user);

	return {
		hostname,
		user,
		password,
	};
}

export function getDatabaseConnectionString(config: DatabaseConfig) {
	const { user, password, hostname } = config;

	return `postgres://${user}:${encodeURIComponent(
		password,
	)}@${hostname}:${databasePort}/postgres?schema=public&sslmode=verify-full&connection_limit=20&pool_timeout=20`;
}

export function getPrismaClient(config: PrismaConfig): PrismaClient {
	const adapter = new PrismaPg({
		connectionString: config.databaseConnectionString,
	});

	return new PrismaClient({
		adapter,
		...(config.withQueryLogging && {
			log: [
				{
					emit: 'stdout',
					level: 'query',
				},
			],
		}),
	});
}
