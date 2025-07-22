import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { awsClientConfig, getSecretManagerValueAsJson } from 'common/aws.js';
import { getEnvOrThrow } from 'common/functions.js';
import type { DatabaseConfig, PrismaConfig } from 'common/src/database-setup.js';
import {
	getDatabaseConfig,
	getDatabaseConnectionString,
	getDevDatabaseConfig,
} from 'common/src/database-setup.js';

interface SecretsManagerCloudqueryApiKey {
	'api-key': string;
	expiry: string;
}

export interface Config extends PrismaConfig {
	/**
	 * The name of this application.
	 */
	app: string;

	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;

	/**
	 * The CloudQuery team name.
	 */
	cloudqueryTeam: string;

	/**
	 * A CloudQuery API key associated with the CloudQuery team.
	 */
	cloudqueryApiKey: string;
}

export async function getConfig(): Promise<Config> {
	const stage = getEnvOrThrow('STAGE');

	const databaseConfig: DatabaseConfig =
		stage === 'DEV'
			? await getDevDatabaseConfig()
			: await getDatabaseConfig(stage, 'cloudquery_usage');

	const queryLogging = process.env['QUERY_LOGGING'] === 'true';

	const cloudqueryApiKeyPath = getEnvOrThrow('CQ_API_KEY_PATH');
	const secretManagerClient = new SecretsManagerClient(awsClientConfig(stage));

	const cloudqueryApiKey =
		await getSecretManagerValueAsJson<SecretsManagerCloudqueryApiKey>(
			secretManagerClient,
			cloudqueryApiKeyPath,
		);

	return {
		app: getEnvOrThrow('APP'),
		stage,
		databaseConnectionString: getDatabaseConnectionString(databaseConfig),
		withQueryLogging: queryLogging,
		cloudqueryTeam: 'the-guardian',
		cloudqueryApiKey: cloudqueryApiKey['api-key'],
	};
}
