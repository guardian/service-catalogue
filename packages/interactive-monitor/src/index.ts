import type { SNSHandler } from 'aws-lambda';
import { stageAwareOctokit } from 'common/functions';
import type { Octokit } from 'octokit';
import { getConfig } from './config';

async function isFromInteractiveTemplate(
	repo: string,
	owner: string,
	octokit: Octokit,
): Promise<boolean> {
	console.log('retrieving repo data');
	const repoData = await octokit.rest.repos.get({
		owner,
		repo,
	});

	const prefix = 'interactive-atom-template';
	console.log('checking if repo is from interactive template');
	return repoData.data.template_repository?.name.includes(prefix) ?? false;
}

async function applyTopics(repo: string, owner: string, octokit: Octokit) {
	const topics = (await octokit.rest.repos.getAllTopics({ owner, repo })).data
		.names;
	console.log(`${repo} is from interactive template`);
	const names = topics.concat(['interactive']);
	await octokit.rest.repos.replaceAllTopics({ owner, repo, names });
	console.log(`added interactive topic to ${repo}`);
}

export async function assessRepo(repo: string, owner: string, stage: string) {
	console.log('Received repo', repo);

	const octokit = await stageAwareOctokit(stage);

	const isInteractive = await isFromInteractiveTemplate(repo, owner, octokit);
	const onProd = stage === 'PROD';
	if (isInteractive && onProd) {
		await applyTopics(repo, owner, octokit);
	} else {
		const reason =
			(!isInteractive ? ' Repo not from interactive template.' : '') +
			(!onProd ? ' Not running on PROD.' : '');
		console.log('No action taken.' + reason);
	}
}

export const handler: SNSHandler = async (event) => {
	const config = getConfig();
	const owner = 'guardian';
	const events = event.Records.map(
		async (record) => await assessRepo(record.Sns.Message, owner, config.stage),
	);
	await Promise.all(events);
};
