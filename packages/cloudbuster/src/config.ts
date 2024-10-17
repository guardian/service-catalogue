import {
	getDatabaseConfig,
	getDatabaseConnectionString,
	getDevDatabaseConfig,
} from 'common/database-setup';
import { getEnvOrThrow } from 'common/functions';
import type { PrismaConfig } from 'common/src/database-setup';

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
	 * Anghammarad's topic ARN
	 */
	anghammaradSnsTopic: string;
}

export async function getConfig(): Promise<Config> {
	const stage = getEnvOrThrow('STAGE');
	const anghammaradSnsTopic: string = getEnvOrThrow('ANGHAMMARAD_SNS_ARN');

	const isDev = stage === 'DEV';

	const databaseConfig = isDev
		? await getDevDatabaseConfig()
		: await getDatabaseConfig(stage, 'cloudbuster');
	return {
		stage,
		databaseConnectionString: getDatabaseConnectionString(databaseConfig),
		withQueryLogging: isDev,
		enableMessaging: !isDev,
		anghammaradSnsTopic,
	};
}
