export interface Config {
	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;

	/**
	 * Github Personal Access Token.
	 *
	 * If the `GITHUB_ACCESS_TOKENB` environment variable is not set, this won't work.
	 */
	githubAccessToken: string;

	/**
	 * SNS topic to use for Anghammarad.
	 */
	anghammaradSnsTopic: string;
}
