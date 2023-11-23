import process from 'process';
import type { DatabaseConfig } from 'common/database';
import {
	getDatabaseConfig,
	getDatabaseConnectionString,
	getDevDatabaseConfig,
} from 'common/database';
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

export async function getConfig(): Promise<Config> {
	const stage = getEnvOrThrow('STAGE');

	const databaseConfig: DatabaseConfig =
		stage === 'DEV'
			? await getDevDatabaseConfig()
			: await getDatabaseConfig(stage, 'dataaudit');

	const queryLogging = (process.env['QUERY_LOGGING'] ?? 'false') === 'true';

	return {
		app: getEnvOrThrow('APP'),
		stage,
		databaseConnectionString: getDatabaseConnectionString(databaseConfig),
		withQueryLogging: queryLogging,
	};
}
