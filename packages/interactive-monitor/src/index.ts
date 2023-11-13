import { getGitHubAppConfig, getGithubClient } from 'common/functions';
import type { GitHubAppConfig } from 'common/types';
import type { Octokit } from 'octokit';

async function isFromInteractiveTemplate(
	repo: string,
	octokit: Octokit,
): Promise<boolean> {
	const repoData = await octokit.rest.repos.get({
		owner: 'guardian',
		repo,
	});

	return (
		repoData.data.template_repository?.name.includes(
			'interactive-atom-template',
		) != null
	);
}

export async function handler() {
	const githubAppConfig: GitHubAppConfig = await getGitHubAppConfig();
	githubAppConfig.strategyOptions.appId;

	const octokit: Octokit = await getGithubClient(githubAppConfig);

	console.log(
		await isFromInteractiveTemplate(
			'interactive-cabinet-reshuffle-2022',
			octokit,
		),
	);
}
