import type { SNSHandler } from 'aws-lambda';
import { applyTopics, parseEvent, stageAwareOctokit } from 'common/functions.js';
import type { Octokit } from 'octokit';
import type { Config } from './config.js';
import { getConfig } from './config.js';
import { tryToParseJsConfig } from './js-parser';
import type { ConfigJsonFile, ContentResponse, FileMetadata } from './types.js';

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
	path: string,
): Promise<ConfigJsonFile | undefined> {
	try {
		const configFile: ContentResponse = await octokit.rest.repos.getContent({
			owner,
			repo,
			path,
		});
		return decodeFile(configFile);
	} catch (e) {
		return undefined;
	}
}

async function s3PathIsInConfig(
	octokit: Octokit,
	owner: string,
	repo: string,
	gitHubFile: string,
): Promise<boolean> {
	const parsedConfig = await getConfigJsonFromGithub(
		octokit,
		repo,
		owner,
		gitHubFile,
	);

	const foundConfig = !!parsedConfig;
	console.debug(`${repo}: Found in ${gitHubFile}: `, foundConfig);
	return foundConfig;
}

export async function assessRepo(repo: string, config: Config) {
	const octokit = await stageAwareOctokit(config.stage);
	const { stage, owner } = config;
	const onProd = stage === 'PROD';

	async function foundInJs(): Promise<boolean> {
		const path = await tryToParseJsConfig(octokit, repo, owner);
		const foundPath = !!path;
		console.debug(`${repo}: Found in JS config: `, foundPath);
		return foundPath;
	}
	const isFromTemplate = await isFromInteractiveTemplate(repo, owner, octokit);

	async function foundInConfigJson() {
		return await s3PathIsInConfig(octokit, owner, repo, 'config.json');
	}
	async function foundInS3Json() {
		return await s3PathIsInConfig(octokit, owner, repo, 'cfg/s3.json');
	}

	async function foundInS3(): Promise<boolean> {
		return (
			(await foundInConfigJson()) ||
			(await foundInS3Json()) ||
			(await foundInJs())
		);
	}

	if ((isFromTemplate || (await foundInS3())) && onProd) {
		await applyTopics(repo, owner, octokit, 'interactive');
	} else {
		console.log(`No action taken for ${repo}.`);
	}
}

export const handler: SNSHandler = async (event) => {
	const config = getConfig();
	console.log(`Detected stage: ${config.stage}`);
	const events = parseEvent<string[]>(event).flat();

	await Promise.all(events.map(async (repo) => await assessRepo(repo, config)));
};
