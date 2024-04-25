import type { PrismaClient } from '@prisma/client';
import type { DatabaseConfig } from 'common/database';
import {
	getDatabaseConfig,
	getDatabaseConnectionString,
	getDevDatabaseConfig,
	getPrismaClient,
} from 'common/database';
import { getEnvOrThrow } from 'common/functions';

export const getObligatronPrismaClient = async (): Promise<PrismaClient> => {
	const stage = getEnvOrThrow('STAGE');

	const databaseConfig: DatabaseConfig =
		stage === 'DEV'
			? await getDevDatabaseConfig()
			: await getDatabaseConfig(stage, 'obligatron');

	const queryLogging = (process.env['QUERY_LOGGING'] ?? 'false') === 'true';

	return getPrismaClient({
		databaseConnectionString: getDatabaseConnectionString(databaseConfig),
		withQueryLogging: queryLogging,
	});
};
