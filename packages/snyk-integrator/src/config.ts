import { getEnvOrThrow } from 'common/functions';

export interface Config {
	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;
}

export function getConfig(): Config {
	return {
		stage: getEnvOrThrow('STAGE'),
	};
}
