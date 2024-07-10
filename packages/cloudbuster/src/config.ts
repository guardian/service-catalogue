import type { PrismaConfig } from 'common/database';
import {
	getDatabaseConfig,
	getDatabaseConnectionString,
	getDevDatabaseConfig,
} from 'common/database';
import { getEnvOrThrow } from 'common/functions';
import type { SecurityHubSeverity } from './types';

export interface Config extends PrismaConfig {
	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;
	/**
	 * The digests will only include findings with these severities.
	 */
	severities: SecurityHubSeverity[];
}

export async function getConfig(): Promise<Config> {
	const stage = getEnvOrThrow('STAGE');
	const isDev = stage === 'DEV';

	const databaseConfig = isDev
		? await getDevDatabaseConfig()
		: await getDatabaseConfig(stage, 'repocop'); //TODO create a new db user for cloudbuster before deploying.

	const severities: SecurityHubSeverity[] = isDev
		? ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATION']
		: ['CRITICAL', 'HIGH'];

	return {
		stage,
		severities,
		databaseConnectionString: getDatabaseConnectionString(databaseConfig),
		withQueryLogging: isDev,
	};
}
