import { getGitHubAppConfig } from 'common/functions';
import type { GitHubAppConfig } from 'common/types';

export async function handler() {
	const githubAppConfig: GitHubAppConfig = await getGitHubAppConfig();
	githubAppConfig.strategyOptions.appId;
	console.log('Hello, world!');
}
