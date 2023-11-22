import { Signer } from '@aws-sdk/rds-signer';
import { awsClientConfig } from 'common/aws';
import { getEnvOrThrow } from 'common/functions';

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
	 * The database password.
	 *
	 * When not defined, a token (temporary password) will be generated for IAM authentication for RDS.
	 */
	password?: string;
}

const databasePort = 5432;

async function getRdsToken(stage: string, config: DatabaseConfig) {
	console.log('Generating RDS token');

	const { hostname, user } = config;

	const signer = new Signer({
		hostname,
		port: databasePort,
		username: user,
		...awsClientConfig(stage),
	});

	return await signer.getAuthToken();
}

export function getDevDatabaseConfig(): Promise<DatabaseConfig> {
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
	const password = await getRdsToken(stage, { hostname, user });

	return {
		hostname,
		user,
		password,
	};
}

export function getDatabaseConnectionString(config: DatabaseConfig) {
	const { user, password, hostname } = config;

	if (!password) {
		throw new Error(
			'Unable to create a database connection string without password',
		);
	}

	return `postgres://${user}:${encodeURIComponent(
		password,
	)}@${hostname}:${databasePort}/postgres?schema=public&sslmode=verify-full&connection_limit=20&pool_timeout=20`;
}