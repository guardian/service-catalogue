import type { DatabaseConfig, PrismaConfig } from 'common/database';
import {
	getDatabaseConfig,
	getDatabaseConnectionString,
	getDevDatabaseConfig,
} from 'common/database';
import { getEnvOrThrow } from 'common/functions';

export interface Config extends PrismaConfig {
	/**
	 * The name of this application.
	 */
	app: string;

	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;
}

export async function getConfig(): Promise<Config> {
	const stage = getEnvOrThrow('STAGE');

	const databaseConfig: DatabaseConfig =
		stage === 'DEV'
			? await getDevDatabaseConfig()
			: await getDatabaseConfig(stage, 'github_actions_usage');

	const queryLogging = (process.env['QUERY_LOGGING'] ?? 'false') === 'true';

	return {
		app: getEnvOrThrow('APP'),
		stage,
		databaseConnectionString: getDatabaseConnectionString(databaseConfig),
		withQueryLogging: queryLogging,
	};
}
