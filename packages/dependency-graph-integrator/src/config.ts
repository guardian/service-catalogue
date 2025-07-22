import { getEnvOrThrow } from 'common/functions.js';

export interface Config {
	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;

	/**
	 * The GitHub organization to use.
	 */
	gitHubOrg: string;
}

export function getConfig(): Config {
	return {
		stage: getEnvOrThrow('STAGE'),
		gitHubOrg: process.env.GITHUB_ORG ?? 'guardian',
	};
}
