import { getEnvOrThrow } from 'common/functions';
import type { PrismaConfig } from 'common/src/database-setup';
import {
	getDatabaseConfig,
	getDatabaseConnectionString,
	getDevDatabaseConfig,
} from 'common/src/database-setup';
import type { Severity } from 'common/src/types';

export interface Config extends PrismaConfig {
	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;
	/**
	 * The digests will only include findings with these severities.
	 */
	severities: Severity[];
}

export async function getConfig(): Promise<Config> {
	const stage = getEnvOrThrow('STAGE');
	const isDev = stage === 'DEV';

	const databaseConfig = isDev
		? await getDevDatabaseConfig()
		: await getDatabaseConfig(stage, 'repocop'); //TODO create a new db user for cloudbuster before deploying.

	const severities: Severity[] = isDev
		? ['critical', 'high', 'medium', 'low', 'information'] // Using all severities in DEV for more data.
		: ['critical', 'high'];

	return {
		stage,
		severities,
		databaseConnectionString: getDatabaseConnectionString(databaseConfig),
		withQueryLogging: isDev,
	};
}
