import type { Message } from '@aws-sdk/client-sqs';
import { SQSClient } from '@aws-sdk/client-sqs';
import { awsClientConfig } from 'common/aws';
import { getGithubClient } from 'common/functions';
import type { UpdateMessageEvent } from 'common/types';
import type { Octokit } from 'octokit';
import { deleteFromQueue, notify, readFromQueue } from './aws-requests';
import { getConfig } from './config';
import type { Config } from './config';
import {
	getDefaultBranchName,
	isBranchProtected,
	updateBranchProtection,
} from './github-requests';

async function protectBranch(
	octokit: Octokit,
	config: Config,
	event: UpdateMessageEvent,
) {
	const [owner, repo] = event.fullName.split('/');

	if (!owner || !repo) {
		throw new Error(`Invalid repo name: ${event.fullName}`);
	}

	let defaultBranchName = undefined;
	try {
		defaultBranchName = await getDefaultBranchName(owner, repo, octokit);
	} catch (error) {
		throw new Error(`Could not find default branch for repo: ${repo}`);
	}

	const branchIsProtected = await isBranchProtected(
		octokit,
		owner,
		repo,
		defaultBranchName,
	);

	const stageIsProd = config.stage === 'PROD';

	if (stageIsProd && !branchIsProtected) {
		await updateBranchProtection(octokit, owner, repo, defaultBranchName);
		for (const slug of event.teamNameSlugs) {
			await notify(event.fullName, config, slug);
		}
		console.log(`Notified teams ${event.teamNameSlugs.join(', ')}}`);
	} else {
		const reason =
			(branchIsProtected ? ' Branch is already protected' : '') +
			(!stageIsProd ? ' Not running on PROD.' : '');
		console.log(`No action required. ${reason}`);
	}
}

async function handleMessage(
	config: Config,
	octokit: Octokit,
	sqs: SQSClient,
	message: Message,
) {
	if (message.Body !== undefined) {
		const event = JSON.parse(message.Body) as UpdateMessageEvent;
		try {
			await protectBranch(octokit, config, event);
		} catch (error) {
			console.warn(`Branch protection failed for ${event.fullName}`);
			console.warn(error);
		}
	}
	await deleteFromQueue(config, message, sqs);
}

export async function main() {
	const config: Config = await getConfig();
	const octokit: Octokit = await getGithubClient(config.githubAppConfig);
	const sqsClient = new SQSClient(awsClientConfig(config.stage));

	const messages: Message[] = await readFromQueue(config, 6, sqsClient);
	await Promise.all(
		messages.map((msg) => handleMessage(config, octokit, sqsClient, msg)),
	);
}
