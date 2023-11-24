import { getEnvOrThrow } from 'common/functions';

export interface Config {
	/**
	 * The stage to run in.
	 */
	stage: string;

	/**
	 * The name of the bucket to use.
	 */
	bucket: string;
}

export function getConfig(): Config {
	return {
		stage: process.env['STAGE'] ?? 'DEV',
		bucket: getEnvOrThrow('BUCKET'),
	};
}
