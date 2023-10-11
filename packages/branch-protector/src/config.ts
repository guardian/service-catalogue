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
		SecretId: process.env['GITHUB_APP_SECRET'],
	});

	const secretJson = JSON.parse(secret.SecretString ?? '{}') as GithubAppSecret;
	return secretJson;
}

export async function getConfig() {
	const secretJson = await getGithubAppSecretJson();
	const config: Config = {
		stage: process.env['STAGE'] ?? 'DEV',
		githubAppConfig: {
			strategyOptions: {
				...secretJson,
				privateKey: atob(secretJson.base64PrivateKey),
			},
			installationId: secretJson.installationId,
		},
		anghammaradSnsTopic: getEnvOrThrow('ANGHAMMARAD'),
	};
	return config;
}
