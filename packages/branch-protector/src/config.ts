import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { SSM, SSMClient } from '@aws-sdk/client-ssm';
import { type StrategyOptions } from '@octokit/auth-app';

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
		installationId: string | number;
	};

	/**
	 * SNS topic to use for Anghammarad.
	 */
	anghammaradSnsTopic: string;
}

async function getAnghammaradTopic(region: string): Promise<string> {
	const ssmClient = new SSMClient({ region: region });
	const ssm = new SSM(ssmClient);
	const topic = await ssm.getParameter({
		Name: '/account/services/anghammarad.topic.arn',
	});

	if (topic.Parameter === undefined) {
		throw new Error('Topic not found');
	}
	return topic.Parameter.Value!;
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
		SecretId:
			'/CODE/deploy/service-catalogue/branch-protector-github-app-secret',
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
		anghammaradSnsTopic: await getAnghammaradTopic('eu-west-1'),
	};
	return config;
}
