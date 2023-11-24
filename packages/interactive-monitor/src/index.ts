import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
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

type ContentResponse =
	RestEndpointMethodTypes['repos']['getContent']['response'];

interface FileMetadata {
	name: string;
	content: string;
}

interface ConfigJsonFile {
	path: string;
}

function decodeFile(response: ContentResponse): ConfigJsonFile {
	const deserialisedResponse = response.data as FileMetadata;
	const fileContents = JSON.parse(
		atob(deserialisedResponse.content),
	) as ConfigJsonFile;

	return fileContents;
}
async function getConfigJsonFromGithub(
	octokit: Octokit,
	repo: string,
	owner: string,
): Promise<ConfigJsonFile | undefined> {
	try {
		const configFile: ContentResponse = await octokit.rest.repos.getContent({
			owner,
			repo,
			path: 'config.json',
		});
		return decodeFile(configFile);
	} catch (e) {
		console.log(`No config.json found for ${repo}`);
		return undefined;
	}
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

	const file = await getConfigJsonFromGithub(octokit, repo, owner);
	const configJsonExists = file !== undefined;

	const isInteractive = await isFromInteractiveTemplate(repo, owner, octokit);
	const onProd = stage === 'PROD';
	if (isInteractive && onProd) {
		await applyTopics(repo, owner, octokit);
	} else if (configJsonExists && onProd) {
		console.log(`Found potential s3 path for ${repo}`);
		console.log('TODO: search s3 for path');
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
