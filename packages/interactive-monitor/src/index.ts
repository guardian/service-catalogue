import type { _Object, ListObjectsCommandInput } from '@aws-sdk/client-s3';
import { ListObjectsCommand, S3Client } from '@aws-sdk/client-s3';
import type { SNSHandler } from 'aws-lambda';
import { stageAwareOctokit } from 'common/functions';
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
	path: string,
): Promise<boolean> {
	const configJson = await getConfigJsonFromGithub(octokit, repo, owner, path);
	if (configJson === undefined) {
		console.log(`${repo}: Found in ${path}: `, false);
		return false;
	} else {
		const s3Response1 = !!(await findInS3(s3, `atoms/${configJson.path}`));
		const s3Response2 = !!(await findInS3(s3, configJson.path));
		const result = s3Response1 || s3Response2;
		console.log(`${repo}: Found in ${path}: `, result);

		return result;
	}
}

async function applyTopics(repo: string, owner: string, octokit: Octokit) {
	console.log(`Applying interactive topic to ${repo}`);
	const topics = (await octokit.rest.repos.getAllTopics({ owner, repo })).data
		.names;
	const names = topics.concat(['interactive']);
	await octokit.rest.repos.replaceAllTopics({ owner, repo, names });
}

export async function assessRepo(repo: string, owner: string, config: Config) {
	const octokit = await stageAwareOctokit(config.stage);
	const s3 = new S3Client({ region: 'us-east-1' });
	const { stage } = config;
	const onProd = stage === 'PROD';
	console.log(`Detected stage: ${stage}`);

	async function foundInJs(): Promise<boolean> {
		const path = await tryToParseJsConfig(octokit, repo);
		if (!path) {
			console.log(`${repo}: Found in JS config: `, false);
			return false;
		}
		const object = await findInS3(s3, `atoms/${path}`);
		const foundObject = !!object;
		console.log(`${repo}: Found in JS config: `, foundObject);
		return foundObject;
	}
	const isFromTemplate = await isFromInteractiveTemplate(repo, owner, octokit);

	async function foundInConfigJson() {
		return await s3PathIsInConfig(octokit, s3, owner, repo, 'config.json');
	}
	async function foundInS3Json() {
		return await s3PathIsInConfig(octokit, s3, owner, repo, 'cfg/s3.json');
	}

	const foundInS3 =
		(await foundInJs()) ||
		(await foundInConfigJson()) ||
		(await foundInS3Json());

	if ((isFromTemplate || foundInS3) && onProd) {
		await applyTopics(repo, owner, octokit);
	} else {
		console.log(`No action taken for ${repo}.`);
	}
}

export const handler: SNSHandler = async (event) => {
	const config = getConfig();
	const owner = 'guardian';
	const events = event.Records.map(
		async (record) => await assessRepo(record.Sns.Message, owner, config),
	);
	await Promise.all(events);
};
