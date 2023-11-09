import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { type StrategyOptions } from '@octokit/auth-app';

//TODO: move to a common place
export function getEnvOrThrow(key: string): string {
	const value: string | undefined = process.env[key];
	if (value === undefined) {
		throw new Error(`Environment variable ${key} is not set.`);
	}
	return value;
}

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
	 * Auth configuration for the GitHub App.
	 */
	githubAppConfig: {
		strategyOptions: StrategyOptions;
		installationId: string;
	};

	/**
	 * SNS topic to use for Anghammarad.
	 */
	anghammaradSnsTopic: string;

	/**
	 * SQS queue to read messages from.
	 */
	queueUrl: string;
}

interface GithubAppSecret {
	appId: string;
	base64PrivateKey: string;
	clientId: string;
	clientSecret: string;
	installationId: string;
}

async function getGithubAppSecretJson(): Promise<GithubAppSecret> {
	const secretsManager = new SecretsManager();

	const secret = await secretsManager.getSecretValue({
		SecretId: getEnvOrThrow('GITHUB_APP_SECRET'),
	});

	const secretJson = JSON.parse(secret.SecretString ?? '{}') as GithubAppSecret;
	return secretJson;
}

export async function getConfig() {
	const secretJson = await getGithubAppSecretJson();
	const config: Config = {
		app: getEnvOrThrow('APP'),
		stage: process.env['STAGE'] ?? 'DEV',
		githubAppConfig: {
			strategyOptions: {
				...secretJson,
				privateKey: atob(secretJson.base64PrivateKey),
			},
			installationId: secretJson.installationId,
		},
		anghammaradSnsTopic: getEnvOrThrow('ANGHAMMARAD_SNS_ARN'),
		queueUrl: getEnvOrThrow('BRANCH_PROTECTOR_QUEUE_URL'),
	};
	return config;
}
