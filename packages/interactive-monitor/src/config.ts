export interface Config {
	/**
	 * The stage to run in.
	 */
	stage: string;

	/**
	 * The GitHub org to use
	 */
	owner: string;
}

export function getConfig(): Config {
	return {
		stage: process.env['STAGE'] ?? 'DEV',
		owner: process.env['GITHUB_ORG'] ?? 'guardian',
	};
}
