export interface Config {
	/**
	 * The stage to run in.
	 */
	stage: string;
}

export function getConfig(): Config {
	return {
		stage: process.env['STAGE'] ?? 'DEV',
	};
}
