import { getEnvOrThrow } from 'common/functions';

export interface Config {
	/**
	 * The name of this application.
	 */
	app: string;

	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;
}

export function getConfig(): Config {
	return {
		app: getEnvOrThrow('APP'), // TODO do we need this?
		stage: getEnvOrThrow('STAGE'),
	};
}
