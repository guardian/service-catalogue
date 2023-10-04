import type { StrategyOptions } from '@octokit/auth-app';

export interface Config {
	/**
	 * The stage of the application, e.g. DEV, CODE, PROD.
	 */
	stage: string;

	/**
	 * Auth configuration for the GitHub App.
	 *
	 * TODO: put in parameter store/secrets manager
	 */
	githubAppConfig: {
		strategyOptions: StrategyOptions;
		installationId: string | number;
	};

	/**
	 * SNS topic to use for Anghammarad.
	 */
	anghammaradSnsTopic: string;
}
