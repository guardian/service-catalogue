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
		const repo = event.Records[0]!.Sns.Message;
		const owner = 'guardian';
		console.log('received repo', repo);

		const githubAppConfig: GitHubAppConfig = await getGitHubAppConfig();
		githubAppConfig.strategyOptions.appId;

		const octokit: Octokit = await getGithubClient(githubAppConfig);

		const isInteractive = await isFromInteractiveTemplate(repo, octokit);
		const topics = (await octokit.rest.repos.getAllTopics({ owner, repo })).data
			.names;

		if (isInteractive) {
			console.log(`${repo}is from interactive template`);
			const names = topics.concat(['interactive']);
			await octokit.rest.repos.replaceAllTopics({ owner, repo, names });
			console.log(`added interactive topic to ${repo}`);
		} else {
			console.log(`${repo}is not from interactive template`);
		}
	}
};
