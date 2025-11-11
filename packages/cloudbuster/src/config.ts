import {
	getDatabaseConfig,
	getDatabaseConnectionString,
	getDevDatabaseConfig,
} from 'common/database-setup.js';
import { getEnvOrThrow } from 'common/functions.js';
import type { PrismaConfig } from 'common/src/database-setup.js';

export interface Config extends PrismaConfig {
	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;
	/**
	 * Whether to send messages via Anghammarad
	 */
	enableMessaging: boolean;
	/**
	 * The number of days we report on vulnerabilities for.
	 */
	cutOffInDays: number;
}

export async function getConfig(): Promise<Config> {
	const stage = getEnvOrThrow('STAGE');

	const isDev = stage === 'DEV';

	const databaseConfig = isDev
		? await getDevDatabaseConfig()
		: await getDatabaseConfig(stage, 'cloudbuster');
	return {
		stage,
		databaseConnectionString: getDatabaseConnectionString(databaseConfig),
		withQueryLogging: isDev,
		enableMessaging: !isDev,
		cutOffInDays: Number(getEnvOrThrow('CUT_OFF_IN_DAYS')),
	};
}
