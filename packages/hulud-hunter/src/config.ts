import * as process from 'process';
import { getEnvOrThrow } from 'common/functions.js';

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
	 * The stack name, ie playground, deployTools.
	 */
	stack: string;

	/**
	 * The ARN of the Anghammarad SNS topic.
	 */
	anghammaradSnsTopic: string;

	/**
	 * The name of the GitHub organisation that owns the repositories.
	 */
	gitHubOrg: string;
}

export function getConfig(): Config {
	const stage = getEnvOrThrow('STAGE');

	return {
		app: getEnvOrThrow('APP'),
		stage,
		stack: getEnvOrThrow('STACK'),
		anghammaradSnsTopic: getEnvOrThrow('ANGHAMMARAD_SNS_ARN'),
		gitHubOrg: process.env['GITHUB_ORG'] ?? 'guardian',
	};
}
