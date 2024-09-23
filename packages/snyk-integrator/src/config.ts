import { getEnvOrThrow } from 'common/functions';

export interface Config {
	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;

	/**
	 * The GitHub org to use
	 */
	owner: string;
}

export function getConfig(): Config {
	return {
		stage: getEnvOrThrow('STAGE'),
		owner: process.env['GITHUB_ORG'] ?? 'guardian',
	};
}
