import * as process from 'process';
import {
	GetSecretValueCommand,
	SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { awsClientConfig } from 'common/aws';
import {
	getDatabaseConfig,
	getDatabaseConnectionString,
	getDevDatabaseConfig,
} from 'common/database';
import type { DatabaseConfig, PrismaConfig } from 'common/database';
import { getEnvOrThrow } from 'common/functions';

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
	 * The stack name, ie playground, deployTools.
	 */
	stack: string;

	/**
	 * The ARN of the Anghammarad SNS topic.
	 */
	anghammaradSnsTopic: string;

	/**
	 * The ARN of the interactive-monitor topic.
	 */
	interactiveMonitorSnsTopic: string;

	/**
	 * Repositories that should not be processed, for example, because they are not owned by a team in Product and Engineering.
	 */
	ignoredRepositoryPrefixes: string[];

	/**
	 * Flag to enable messaging when running locally.
	 */
	enableMessaging: boolean;

	/**
	 * The number of repositories to send to the interactive monitor for evaluation.
	 */
	interactivesCount: number;

	/**
	 * Flag to enable branch protection.
	 */
	branchProtectionEnabled: boolean;

	/**
	 * Flag to enable creation of Snyk integration PRs
	 */
	snykIntegrationPREnabled: boolean;

	/**
	 * The ARN of the Snyk Integrator input topic.
	 */
	snykIntegratorTopic: string;

	/**
	 * The API key for Snyk.
	 */
	snykReadOnlyKey: string;

	/**
	 * The Snyk group ID.
	 */
	snykGroupId: string;

	/**
	 * The Snyk API version.
	 */
	snykApiVersion: string;
}

export async function getConfig(): Promise<Config> {
	const queryLogging = (process.env['QUERY_LOGGING'] ?? 'false') === 'true';

	const stage = getEnvOrThrow('STAGE');

	const databaseConfig: DatabaseConfig =
		stage === 'DEV'
			? await getDevDatabaseConfig()
			: await getDatabaseConfig(stage, 'repocop');

	const snykSecretValues = await getSnykSecretValues(stage);

	return {
		app: getEnvOrThrow('APP'),
		stage,
		stack: getEnvOrThrow('STACK'),
		anghammaradSnsTopic: getEnvOrThrow('ANGHAMMARAD_SNS_ARN'),
		interactiveMonitorSnsTopic: getEnvOrThrow('INTERACTIVE_MONITOR_TOPIC_ARN'),
		databaseConnectionString: getDatabaseConnectionString(databaseConfig),
		withQueryLogging: queryLogging,
		enableMessaging: process.env.ENABLE_MESSAGING === 'false' ? false : true,
		ignoredRepositoryPrefixes: [
			'guardian/esd-', // ESD team
			'guardian/pluto-', // Multimedia team
		],
		interactivesCount: Number(getEnvOrThrow('INTERACTIVES_COUNT')),
		branchProtectionEnabled: process.env.BRANCH_PROTECTION_ENABLED === 'true',
		snykIntegrationPREnabled:
			process.env.SNYK_INTEGRATION_PR_ENABLED === 'true',
		snykIntegratorTopic: getEnvOrThrow('SNYK_INTEGRATOR_INPUT_TOPIC_ARN'),
		snykReadOnlyKey: snykSecretValues['api-key'].replaceAll("'", ''),
		snykGroupId: snykSecretValues['group-id'].replaceAll("'", ''),
		snykApiVersion: '2024-01-04',
	};

	interface SnykSecret {
		readonly 'api-key': string;
		readonly 'group-id': string;
	}

	async function getSnykSecretValues(stage: string): Promise<SnykSecret> {
		const snykSecretArn = getEnvOrThrow('SNYK_API_KEY_ARN');

		const secretManager = new SecretsManagerClient(awsClientConfig(stage));

		const secretCommand = new GetSecretValueCommand({
			SecretId: snykSecretArn,
		});

		const snykSecret = (await secretManager.send(secretCommand)).SecretString;

		if (!snykSecret) {
			throw new Error('Snyk secret not found');
		}

		return JSON.parse(snykSecret) as SnykSecret;
	}
}
