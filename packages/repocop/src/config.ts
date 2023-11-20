import * as process from 'process';
import { Signer } from '@aws-sdk/rds-signer';
import { awsClientConfig } from 'common/aws';
import { getEnvOrThrow } from 'common/functions';

export interface Config {
	/**
	 * The name of this application.
	 */
	app: string;

	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;

	/**
	 * The ARN of the Anghammarad SNS topic.
	 */
	anghammaradSnsTopic: string;

	/**
	 * The ARN of the interactive-monitor topic.
	 */
	interactiveMonitorSnsTopic: string;

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
	 * SQS queue to send branch protector messages to.
	 */
	branchProtectorQueueUrl: string;

	/**
	 * SQS queue to send topic 'production' messages to.
	 */
	topicMonitoringProductionTagQueueUrl: string;

	/**
	 * Flag to enable messaging when running locally.
	 */
	enableMessaging: boolean;
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

	const stage = getEnvOrThrow('STAGE');

	return {
		app: getEnvOrThrow('APP'),
		stage,
		anghammaradSnsTopic: getEnvOrThrow('ANGHAMMARAD_SNS_ARN'),
		interactiveMonitorSnsTopic: getEnvOrThrow('INTERACTIVE_MONITOR_TOPIC_ARN'),
		databaseConnectionString: await getDatabaseConnectionString(
			stage,
			databaseConfig,
		),
		withQueryLogging: queryLogging,
		branchProtectorQueueUrl: getEnvOrThrow('BRANCH_PROTECTOR_QUEUE_URL'),
		topicMonitoringProductionTagQueueUrl: getEnvOrThrow(
			'BRANCH_PROTECTOR_QUEUE_URL',
		), // TODO: remove this
		// topicMonitoringProductionTagQueueUrl: getEnvOrThrow('TOPIC_MONITORING_PRODUCTION_TAG_QUEUE_URL'), // TODO: produce this
		enableMessaging: process.env.ENABLE_MESSAGING === 'false' ? false : true,
		ignoredRepositoryPrefixes: [
			'guardian/esd-', // ESD team
			'guardian/pluto-', // Multimedia team
		],
	};
}

async function getRdsToken(stage: string, config: DatabaseConfig) {
	console.log('Generating RDS token');

	const { hostname, port, user } = config;

	const signer = new Signer({
		hostname,
		port,
		username: user,
		...awsClientConfig(stage),
	});

	return await signer.getAuthToken();
}

async function getDatabaseConnectionString(
	stage: string,
	config: DatabaseConfig,
) {
	const { user, password, hostname, port } = config;
	const dbPassword = password ?? (await getRdsToken(stage, config));

	return `postgres://${user}:${encodeURIComponent(
		dbPassword,
	)}@${hostname}:${port}/postgres?schema=public&sslmode=verify-full&connection_limit=20&pool_timeout=20`;
}
