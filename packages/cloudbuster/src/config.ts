import { Anghammarad } from '@guardian/anghammarad';
import type { PrismaConfig } from 'common/database';
import {
	getDatabaseConfig,
	getDatabaseConnectionString,
	getDevDatabaseConfig,
} from 'common/database';
import { getEnvOrThrow } from 'common/functions';

export interface Config extends PrismaConfig {
	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;
	/**
	 * Anghammarad client for sending notifications.
	 */
	anghammaradClient?: Anghammarad;
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

	const anghammaradClient = isDev ? undefined : new Anghammarad();
	const anghammaradSnsTopic = process.env['ANGHAMMARAD_SNS_ARN'];

	return {
		stage,
		databaseConnectionString: getDatabaseConnectionString(databaseConfig),
		withQueryLogging: isDev,
		anghammaradClient,
		anghammaradSnsTopic,
	};
}
