import type { SNSHandler } from 'aws-lambda';
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

	const prefix = 'interactive-atom-template';

	return repoData.data.template_repository?.name.includes(prefix) ?? false;
}

export const handler: SNSHandler = async (event) => {
	if (event.Records.length !== 1) {
		throw new Error(
			`Expected exactly one record, but got ${event.Records.length}`,
		);
	} else {
		const message = event.Records[0]!.Sns.Message;
		console.log('received message', message);

		const githubAppConfig: GitHubAppConfig = await getGitHubAppConfig();
		githubAppConfig.strategyOptions.appId;

		const octokit: Octokit = await getGithubClient(githubAppConfig);

		console.log(await isFromInteractiveTemplate(message, octokit));
	}
};
