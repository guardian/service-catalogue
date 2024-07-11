import type { PrismaConfig } from 'common/database';
import {
	getDatabaseConfig,
	getDatabaseConnectionString,
	getDevDatabaseConfig,
} from 'common/database';
import { getEnvOrThrow } from 'common/functions';

export const MAX_FINDINGS = 8;

export interface Config extends PrismaConfig {
	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;
	/**
	 * Anghammarad's topic ARN
	 */
	anghammaradSnsTopic?: string;
}

export async function getConfig(): Promise<Config> {
	const stage = getEnvOrThrow('STAGE');
	const isDev = stage === 'DEV';

	const databaseConfig = isDev
		? await getDevDatabaseConfig()
		: await getDatabaseConfig(stage, 'repocop'); //TODO create a new db user for cloudbuster before deploying.

	const anghammaradSnsTopic = process.env['ANGHAMMARAD_SNS_ARN'];

	return {
		stage,
		databaseConnectionString: getDatabaseConnectionString(databaseConfig),
		withQueryLogging: isDev,
		anghammaradSnsTopic,
	};
}
