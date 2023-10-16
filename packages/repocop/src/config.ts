import { Signer } from '@aws-sdk/rds-signer';

export interface Config {
	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;

	/**
	 * The database connection string.
	 *
	 * If the `DATABASE_PASSWORD` environment variable is not set, a token (temporary password) will be generated for IAM authentication for RDS.
	 */
	databaseConnectionString: string;

	/**
	 * Whether to configure Prisma to log the SQL queries being executed.
	 *
	 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/logging
	 */
	withQueryLogging: boolean;

	/**
	 * Repositories that should not be processed, for example, because they are not owned by a team in Product and Engineering.
	 */
	ignoredRepositoryPrefixes: string[];

	/**
	 * SQS queue to send messages to.
	 */
	queueUrl: string;
}

interface DatabaseConfig {
	/**
	 * The hostname of the database.
	 */
	hostname: string;

	/**
	 * The database user.
	 *
	 * @default repocop
	 */
	user: string;

	/**
	 * The database port.
	 *
	 * @default 5432
	 */
	port: number;

	/**
	 * The database password.
	 *
	 * When not defined, a token (temporary password) will be generated for IAM authentication for RDS.
	 */
	password?: string;
}

function getEnvOrThrow(key: string): string {
	const value = process.env[key];
	if (value === undefined) {
		throw new Error(`Environment variable ${key} is not set`);
	}
	return value;
}
export async function getConfig(): Promise<Config> {
	const databaseConfig: DatabaseConfig = {
		hostname: getEnvOrThrow('DATABASE_HOSTNAME'),
		user: process.env['DATABASE_USER'] ?? 'repocop',
		port: process.env['DATABASE_PORT']
			? parseInt(process.env['DATABASE_PORT'])
			: 5432,
		password: process.env['DATABASE_PASSWORD'],
	};

	const queryLogging = (process.env['QUERY_LOGGING'] ?? 'false') === 'true';

	return {
		stage: getEnvOrThrow('STAGE'),
		databaseConnectionString: await getDatabaseConnectionString(databaseConfig),
		withQueryLogging: queryLogging,
		queueUrl: getEnvOrThrow('QUEUE_URL'),
		ignoredRepositoryPrefixes: [
			// Visuals team
			'guardian/interactive-',
			'guardian/interactives-',
			'guardian/oz-',
			'guardian/aus-',
			'guardian/australia-',
			'guardian/australian-',
			'guardian/visuals-',
			'guardian/us-',
			'guardian/main-media-',

			// ESD team
			'guardian/esd-',

			// Multimedia team
			'guardian/pluto-',
		],
	};
}

async function getRdsToken(config: DatabaseConfig) {
	console.log('Generating RDS token');

	const { hostname, port, user } = config;

	const signer = new Signer({
		hostname,
		port,
		username: user,
		region: 'eu-west-1',
	});

	return await signer.getAuthToken();
}

async function getDatabaseConnectionString(config: DatabaseConfig) {
	const { user, password, hostname, port } = config;
	const dbPassword = password ?? (await getRdsToken(config));

	return `postgres://${user}:${encodeURIComponent(
		dbPassword,
	)}@${hostname}:${port}/postgres?schema=public&sslmode=verify-full`;
}
