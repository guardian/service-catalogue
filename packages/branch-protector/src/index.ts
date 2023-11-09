import type { Message } from '@aws-sdk/client-sqs';
import { SQSClient } from '@aws-sdk/client-sqs';
import type { UpdateBranchProtectionEvent } from 'common/types';
import type { Octokit } from 'octokit';
import { deleteFromQueue, notify, readFromQueue } from './aws-requests';
import { getConfig } from './config';
import type { Config } from './config';
import {
	getDefaultBranchName,
	getGithubClient,
	isBranchProtected,
	updateBranchProtection,
} from './github-requests';

async function protectBranch(
	octokit: Octokit,
	config: Config,
	event: UpdateBranchProtectionEvent,
) {
	const [owner, repo] = event.fullName.split('/');

	if (!owner || !repo) {
		throw new Error(`Invalid repo name: ${event.fullName}`);
	}

	let defaultBranchName = undefined;
	try {
		defaultBranchName = await getDefaultBranchName(owner, repo, octokit);
	} catch (error) {
		throw new Error(`Could not obtain branch name for repo: ${repo}`);
	}

	const branchIsProtected = await isBranchProtected(
		octokit,
		owner,
		repo,
		defaultBranchName,
	);

	console.log(`${repo} branch protection: ${branchIsProtected.toString()}`);

	const stageIsProd = config.stage === 'PROD';

	if (stageIsProd) {
		if (branchIsProtected) {
			console.log(`No action required`);
		} else {
			await updateBranchProtection(octokit, owner, repo, defaultBranchName);
			for (const slug of event.teamNameSlugs) {
				await notify(event.fullName, config, slug);
			}
			console.log(`Notified teams`);
		}
	} else {
		// !stageIsProd
		console.log(`Detected stage: ${config.stage}. No action taken`);
	}
}

async function handleMessage(
	config: Config,
	octokit: Octokit,
	sqs: SQSClient,
	message: Message,
) {
	if (message.Body !== undefined) {
		const event = JSON.parse(message.Body) as UpdateBranchProtectionEvent;
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
	const octokit: Octokit = await getGithubClient(config);
	const sqsClient = new SQSClient({});

	const messages: Message[] = await readFromQueue(config, 10, sqsClient);
	await Promise.all(
		messages.map((msg) => handleMessage(config, octokit, sqsClient, msg)),
	);
}
