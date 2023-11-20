import type { SNSHandler } from 'aws-lambda';
import { stageAwareOctokit } from 'common/functions';
import type { Octokit } from 'octokit';
import { getConfig } from './config';

async function isFromInteractiveTemplate(
	repo: string,
	owner: string,
	octokit: Octokit,
): Promise<boolean> {
	const repoData = await octokit.rest.repos.get({
		owner,
		repo,
	});
	const prefix = 'interactive-atom-template';
	return repoData.data.template_repository?.name.includes(prefix) ?? false;
}

async function applyTopics(repo: string, owner: string, octokit: Octokit) {
	console.log(`Applying interactive topic to ${repo}`);
	const topics = (await octokit.rest.repos.getAllTopics({ owner, repo })).data
		.names;
	const names = topics.concat(['interactive']);
	await octokit.rest.repos.replaceAllTopics({ owner, repo, names });
}

export async function assessRepo(repo: string, owner: string, stage: string) {
	const octokit = await stageAwareOctokit(stage);

	const isInteractive = await isFromInteractiveTemplate(repo, owner, octokit);
	const onProd = stage === 'PROD';
	if (isInteractive && onProd) {
		await applyTopics(repo, owner, octokit);
	} else {
		const reason =
			(!isInteractive ? ' Repo not from interactive template.' : '') +
			(!onProd ? ' Not running on PROD.' : '');
		console.log(`No action taken for ${repo}.` + reason);
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
