import * as process from 'process';
import { getEnvOrThrow } from 'common/functions.js';
import {
	getDatabaseConfig,
	getDatabaseConnectionString,
	getDevDatabaseConfig,
} from 'common/src/database-setup.js';
import type { DatabaseConfig, PrismaConfig } from 'common/src/database-setup.js';

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
	 * The ARN of the Dependency Graph Integrator input topic.
	 */
	dependencyGraphIntegratorTopic: string;

	/**
	 * The name of the GitHub organisation that owns the repositories.
	 */
	gitHubOrg: string;

	/**
	 * The number of days we report on vulnerabilities for.
	 */
	cutOffInDays: number;
}

export async function getConfig(): Promise<Config> {
	const queryLogging = (process.env['QUERY_LOGGING'] ?? 'false') === 'true';

	const stage = getEnvOrThrow('STAGE');

	const databaseConfig: DatabaseConfig =
		stage === 'DEV'
			? await getDevDatabaseConfig()
			: await getDatabaseConfig(stage, 'repocop');

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
		dependencyGraphIntegratorTopic: getEnvOrThrow(
			'DEPENDENCY_GRAPH_INPUT_TOPIC_ARN',
		),
		gitHubOrg: process.env['GITHUB_ORG'] ?? 'guardian',
		cutOffInDays: Number(getEnvOrThrow('CUT_OFF_IN_DAYS'))
	};
}
