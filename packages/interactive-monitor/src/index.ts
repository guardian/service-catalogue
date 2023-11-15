import type { SNSHandler } from 'aws-lambda';
import { getGitHubAppConfig, getGithubClient } from 'common/functions';
import type { GitHubAppConfig } from 'common/types';
import type { Octokit } from 'octokit';
import { getConfig } from './config';

async function isFromInteractiveTemplate(
	repo: string,
	octokit: Octokit,
): Promise<boolean> {
	console.log('retrieving repo data');
	const repoData = await octokit.rest.repos.get({
		owner: 'guardian',
		repo,
	});

	const prefix = 'interactive-atom-template';
	console.log('checking if repo is from interactive template');
	return repoData.data.template_repository?.name.includes(prefix) ?? false;
}

export const handler: SNSHandler = async (event) => {
	const config = getConfig();
	if (event.Records.length !== 1) {
		throw new Error(
			`Expected exactly one record, but got ${event.Records.length}`,
		);
	} else {
		const repo = event.Records[0]!.Sns.Message;
		const owner = 'guardian';
		console.log('received repo', repo);
		const githubAppConfig: GitHubAppConfig = await getGitHubAppConfig();
		const octokit: Octokit = await getGithubClient(githubAppConfig);

		const isInteractive = await isFromInteractiveTemplate(repo, octokit);
		const topics = (await octokit.rest.repos.getAllTopics({ owner, repo })).data
			.names;

		if (isInteractive && config.stage === 'PROD') {
			console.log(`${repo}is from interactive template`);
			const names = topics.concat(['interactive']);
			await octokit.rest.repos.replaceAllTopics({ owner, repo, names });
			console.log(`added interactive topic to ${repo}`);
		} else {
			console.log('No action taken');
		}
	}
};
