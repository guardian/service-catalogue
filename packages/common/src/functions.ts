import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { fromIni } from '@aws-sdk/credential-providers';
import type { Action } from '@guardian/anghammarad';
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from 'octokit';
import type { GitHubAppConfig, GithubAppSecret } from 'common/types';

export async function getGithubClient(githubAppConfig: GitHubAppConfig) {
	const auth = createAppAuth(githubAppConfig.strategyOptions);

	const installationAuthentication = await auth({
		type: 'installation',
		installationId: githubAppConfig.installationId,
	});

	const octokit: Octokit = new Octokit({
		auth: installationAuthentication.token,
	});
	return octokit;
}

export function getEnvOrThrow(key: string): string {
	const value: string | undefined = process.env[key];
	if (value === undefined) {
		throw new Error(`Environment variable ${key} is not set.`);
	}
	return value;
}

async function getGithubAppSecret(): Promise<string> {
	const SecretId = getEnvOrThrow('GITHUB_APP_SECRET');
	const secretsManager = new SecretsManager();

	const secret = await secretsManager.getSecretValue({ SecretId });
	if (!secret.SecretString) {
		throw new Error(`Secret ${SecretId} has no SecretString`);
	} else {
		return secret.SecretString;
	}
}

export function parseSecretJson(secretString: string): GitHubAppConfig {
	const secretJson = JSON.parse(secretString) as GithubAppSecret;
	const githubAppConfig: GitHubAppConfig = {
		strategyOptions: {
			...secretJson,
			privateKey: atob(secretJson.base64PrivateKey),
		},
		installationId: secretJson.installationId,
	};
	return githubAppConfig;
}

export async function getGitHubAppConfig(): Promise<GitHubAppConfig> {
	const secretString = await getGithubAppSecret();
	const githubAppConfig = parseSecretJson(secretString);
	return githubAppConfig;
}

export async function stageAwareOctokit(stage: string) {
	if (stage === 'DEV') {
		const token = getEnvOrThrow('GITHUB_ACCESS_TOKEN');
		return new Octokit({ auth: token });
	} else {
		const githubAppConfig: GitHubAppConfig = await getGitHubAppConfig();
		const octokit: Octokit = await getGithubClient(githubAppConfig);
		return octokit;
	}
}

export function branchProtectionCtas(
	fullRepoName: string,
	teamSlug: string,
): Action[] {
	const githubUrl = `https://github.com/${fullRepoName}`;
	const grafanaUrl = `https://metrics.gutools.co.uk/d/EOPnljWIz/repocop-compliance?var-team=${teamSlug}&var-rule=All&orgId=1`;
	const protectionUrl = `https://github.com/${fullRepoName}/settings/branches`;

	return [
		{ cta: 'Repository', url: githubUrl },
		{
			cta: 'Compliance information for repos',
			url: grafanaUrl,
		},
		{
			cta: 'Branch protections',
			url: protectionUrl,
		},
	];
}

export function topicMonitoringProductionTagCtas(
	fullRepoName: string,
	teamSlug: string,
): Action[] {
	const githubUrl = `https://github.com/${fullRepoName}`;
	const grafanaUrl = `https://metrics.gutools.co.uk/d/EOPnljWIz/repocop-compliance?var-team=${teamSlug}&var-rule=All&orgId=1`;
	const topicsUrl = `https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics#adding-topics-to-your-repository`;

	return [
		{ cta: 'Repository', url: githubUrl },
		{
			cta: 'Compliance information for repos',
			url: grafanaUrl,
		},
		{
			cta: 'How to add a topic',
			url: topicsUrl,
		},
	];
}

export function anghammaradThreadKey(fullRepoName: string) {
	return `service-catalogue-${fullRepoName.replaceAll('/', '-')}`;
}

export function shuffle<T>(array: T[]): T[] {
	return array.sort(() => Math.random() - 0.5);
}

export function getLocalProfile(stage: string) {
	return stage === 'DEV' ? fromIni({ profile: 'deployTools' }) : undefined;
}
