import type { _Object, ListObjectsCommandInput } from '@aws-sdk/client-s3';
import { ListObjectsCommand, S3Client } from '@aws-sdk/client-s3';
import type { SNSHandler } from 'aws-lambda';
import { awsClientConfig } from 'common/aws';
import { applyTopics, parseEvent, stageAwareOctokit } from 'common/functions';
import type { Octokit } from 'octokit';
import type { Config } from './config';
import { getConfig } from './config';
import { tryToParseJsConfig } from './js-parser';
import type { ConfigJsonFile, ContentResponse, FileMetadata } from './types';

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

async function findInS3(
	s3: S3Client,
	prefix: string,
): Promise<_Object[] | undefined> {
	const input: ListObjectsCommandInput = {
		Bucket: 'gdn-cdn',
		Prefix: `${prefix}`,
		MaxKeys: 1,
	};
	const command = new ListObjectsCommand(input);
	const response = await s3.send(command);
	return response.Contents;
}

async function s3PathIsInConfig(
	octokit: Octokit,
	s3: S3Client,
	owner: string,
	repo: string,
	gitHubFile: string,
	s3Prefix?: string,
): Promise<boolean> {
	const parsedConfig = await getConfigJsonFromGithub(
		octokit,
		repo,
		owner,
		gitHubFile,
	);
	if (parsedConfig === undefined) {
		console.debug(`${repo}: Found in ${gitHubFile}: `, false);
		return false;
	} else {
		return !!(await findInS3(s3, `${s3Prefix ?? ''}/${parsedConfig.path}`));
	}
}

export async function assessRepo(repo: string, owner: string, config: Config) {
	const octokit = await stageAwareOctokit(config.stage);
	const awsConfig = awsClientConfig(config.stage);
	const s3 = new S3Client({ ...awsConfig, region: 'us-east-1' });
	const { stage } = config;
	const onProd = stage === 'PROD';

	async function foundInJs(): Promise<boolean> {
		const path = await tryToParseJsConfig(octokit, repo);
		if (!path) {
			console.debug(`${repo}: Found in JS config: `, false);
			return false;
		}
		const object = await findInS3(s3, `atoms/${path}`);
		const foundObject = !!object;
		console.debug(`${repo}: Found in JS config: `, foundObject);
		return foundObject;
	}
	const isFromTemplate = await isFromInteractiveTemplate(repo, owner, octokit);

	async function foundInConfigJson() {
		return await s3PathIsInConfig(
			octokit,
			s3,
			owner,
			repo,
			'config.json',
			'atoms',
		);
	}
	async function foundInS3Json() {
		return await s3PathIsInConfig(octokit, s3, owner, repo, 'cfg/s3.json');
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
	const owner = 'guardian';
	console.log(`Detected stage: ${config.stage}`);
	const events = parseEvent<string[]>(event).flat();

	await Promise.all(
		events.map(async (repo) => await assessRepo(repo, owner, config)),
	);
};
