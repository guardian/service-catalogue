import { getEnvOrThrow, getGitHubAppConfig } from 'common/functions';
import type { GitHubAppConfig } from 'common/types';

export interface Config {
	/**
	 * The name of this application.
	 */
	app: string;

	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;

	/**
	 * Auth configuration for the GitHub App.
	 */
	githubAppConfig: GitHubAppConfig;

	/**
	 * SNS topic to use for Anghammarad.
	 */
	anghammaradSnsTopic: string;

	/**
	 * SQS queue to read messages from.
	 */
	queueUrl: string;
}

export async function getConfig() {
	const config: Config = {
		app: getEnvOrThrow('APP'),
		stage: process.env['STAGE'] ?? 'DEV',
		githubAppConfig: await getGitHubAppConfig(),
		anghammaradSnsTopic: getEnvOrThrow('ANGHAMMARAD_SNS_ARN'),
		queueUrl: getEnvOrThrow('BRANCH_PROTECTOR_QUEUE_URL'),
	};
	return config;
}
