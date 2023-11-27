import type { _Object, ListObjectsCommandInput } from '@aws-sdk/client-s3';
import { ListObjectsCommand, S3Client } from '@aws-sdk/client-s3';
import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import type { SNSHandler } from 'aws-lambda';
import { stageAwareOctokit } from 'common/functions';
import type { Octokit } from 'octokit';
import type { Config } from './config';
import { getConfig } from './config';

type ContentResponse =
	RestEndpointMethodTypes['repos']['getContent']['response'];

interface FileMetadata {
	name: string;
	content: string;
}

interface ConfigJsonFile {
	path: string;
}

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
		console.log(`No ${path} found for ${repo}`);
		return undefined;
	}
}

async function findInS3(
	s3: S3Client,
	prefix: string,
): Promise<_Object[] | undefined> {
	const input: ListObjectsCommandInput = {
		Bucket: 'gdn-cdn',
		Prefix: `atoms/${prefix}`,
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
): Promise<boolean> {
	const configJson = await getConfigJsonFromGithub(
		octokit,
		repo,
		owner,
		'config.json',
	);
	if (configJson === undefined) {
		return false;
	} else {
		const s3Response = await findInS3(s3, configJson.path);
		return s3Response !== undefined;
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

	const isFromTemplate = await isFromInteractiveTemplate(repo, owner, octokit);
	const foundInS3 = await s3PathIsInConfig(octokit, s3, owner, repo);
	const onProd = stage === 'PROD';
	console.log(`Detected stage: ${stage}`);

	if ((isFromTemplate || foundInS3) && onProd) {
		await applyTopics(repo, owner, octokit);
	} else {
		console.log(`No action taken for ${repo}.`);
		console.log('Artifacts found in S3: ', foundInS3);
		console.log('Repo is from interactive template: ', isFromTemplate);
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
