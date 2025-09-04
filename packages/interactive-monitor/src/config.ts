import { getEnvOrThrow } from 'common/functions.js';

export interface Config {
	/**
	 * The name of this application.
	 */
	app: string;
	/**
	 * The stage to run in.
	 */
	stage: string;

	/**
	 * The GitHub org to use
	 */
	owner: string;
	/**
	 * The ARN of the Anghammarad SNS topic.
	 */
	anghammaradSnsTopic: string;
}

export function getConfig(): Config {
	return {
		app: getEnvOrThrow('APP'),
		stage: process.env['STAGE'] ?? 'DEV',
		owner: process.env['GITHUB_ORG'] ?? 'guardian',
		anghammaradSnsTopic: getEnvOrThrow('ANGHAMMARAD_SNS_ARN'),
	};
}
