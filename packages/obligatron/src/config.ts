import { getEnvOrThrow } from 'common/functions.js';
import type { PrismaConfig } from 'common/src/database-setup.js';
import {
	getDatabaseConfig,
	getDatabaseConnectionString,
	getDevDatabaseConfig,
} from 'common/src/database-setup.js';

export interface Config extends PrismaConfig {
	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;
}

export async function getConfig(): Promise<Config> {
	const stage = getEnvOrThrow('STAGE');
	const databaseConfig =
		stage === 'DEV'
			? await getDevDatabaseConfig()
			: await getDatabaseConfig(stage, 'obligatron');
	return {
		stage,
		databaseConnectionString: getDatabaseConnectionString(databaseConfig),
		// Our insert queries are VERY big, so don't log them
		withQueryLogging: false,
	};
}
