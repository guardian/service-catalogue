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
	/**
	 * Anghammarad's topic ARN
	 */
	anghammaradSnsTopic: string;
}

export async function getConfig(): Promise<Config> {
	const stage = getEnvOrThrow('STAGE');
	const isDev = stage === 'DEV';

	const databaseConfig = isDev
		? await getDevDatabaseConfig()
		: await getDatabaseConfig(stage, 'repocop'); //TODO create a new db user for cloudbuster before deploying.

	const severities: SecurityHubSeverity[] = isDev
		? ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATION'] // Using all severities in DEV for more data.
		: ['CRITICAL', 'HIGH'];

	const anghammaradSnsTopic = getEnvOrThrow('ANGHAMMARAD_SNS_ARN');

	return {
		stage,
		severities,
		databaseConnectionString: getDatabaseConnectionString(databaseConfig),
		withQueryLogging: isDev,
		anghammaradSnsTopic,
	};
}
