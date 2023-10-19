import type { Message } from '@aws-sdk/client-sqs';
import { SQSClient } from '@aws-sdk/client-sqs';
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
import type { UpdateBranchProtectionEvent } from './model';

async function protectBranch(
	octokit: Octokit,
	config: Config,
	event: UpdateBranchProtectionEvent,
) {
	const [owner, repo] = event.fullName.split('/');

	if (!owner || !repo) {
		throw new Error(`Invalid repo name: ${event.fullName}`);
	}

	const defaultBranchName = await getDefaultBranchName(owner, repo, octokit);
	const branchIsProtected = await isBranchProtected(
		octokit,
		owner,
		repo,
		defaultBranchName,
	);

	console.log(`${repo} branch protection: ${branchIsProtected.toString()}`);

	const stageIsProd = config.stage === 'PROD';

	if (branchIsProtected && stageIsProd) {
		console.log(`No action required`);
	} else if (!branchIsProtected && stageIsProd) {
		await updateBranchProtection(octokit, owner, repo, defaultBranchName);
		console.log(`Updated ${repo}'s default branch protection`);
		for (const slug of event.teamNameSlugs) {
			await notify(event.fullName, config.anghammaradSnsTopic, slug);
		}
		console.log(`Notified teams`);
	} else {
		// !stageIsProd
		console.log(`Detected stage: ${config.stage}. No action taken.`);
	}
}

function createEvents(
	config: Config,
	messages: Message[],
): UpdateBranchProtectionEvent[] {
	const res = messages
		.map((msg) => msg.Body)
		.filter((msg): msg is string => !!msg)
		.map((msg) => JSON.parse(msg) as UpdateBranchProtectionEvent);

	return res;
}

export async function main() {
	const config: Config = await getConfig();
	const octokit: Octokit = await getGithubClient(config);
	const sqsClient = new SQSClient({});

	const messages = await readFromQueue(config, 1, sqsClient);
	const events = createEvents(config, messages);
	await Promise.all(
		events.map(async (event) => await protectBranch(octokit, config, event)),
	);
	await Promise.all(
		messages.map(async (msg) => await deleteFromQueue(config, msg, sqsClient)),
	);
}
