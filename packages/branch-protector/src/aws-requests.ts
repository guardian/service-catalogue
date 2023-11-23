import type { Message, SQSClient } from '@aws-sdk/client-sqs';
import {
	DeleteMessageCommand,
	ReceiveMessageCommand,
} from '@aws-sdk/client-sqs';
import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import {
	anghammaradThreadKey,
	branchProtectionCtas,
} from 'common/src/functions';
import type { Config } from './config';

export async function readFromQueue(
	config: Config,
	msgCount: number,
	sqs: SQSClient,
): Promise<Message[]> {
	const getCommand = new ReceiveMessageCommand({
		QueueUrl: config.queueUrl,
		MaxNumberOfMessages: msgCount,
		WaitTimeSeconds: 5,
	});

	const result = await sqs.send(getCommand);
	if (result.Messages === undefined) {
		console.log('No messages found');
	}
	return result.Messages ?? [];
}

export async function deleteFromQueue(
	config: Config,
	message: Message,
	sqs: SQSClient,
) {
	const messageId = message.MessageId ?? 'unknown';
	const deleteCommand = new DeleteMessageCommand({
		QueueUrl: config.queueUrl,
		ReceiptHandle: message.ReceiptHandle,
	});

	try {
		await sqs.send(deleteCommand);
		console.log(`Deleted message ${messageId}`);
	} catch (error) {
		console.warn(`Delete failed for ${messageId}`);
		console.warn(error);
	}
}

export async function notify(
	fullRepoName: string,
	config: Config,
	teamSlug: string,
) {
	const { app, stage, anghammaradSnsTopic } = config;

	const client = new Anghammarad();
	await client.notify({
		subject: `RepoCop branch protections (for GitHub team ${teamSlug})`,
		message:
			`Branch protections have been applied to ${fullRepoName}. ` +
			`CI checks and at least one approval will now be required before merging to the default branch.`,
		actions: branchProtectionCtas(fullRepoName, teamSlug),
		target: { GithubTeamSlug: teamSlug },
		channel: RequestedChannel.PreferHangouts,
		sourceSystem: `${app} ${stage}`,
		topicArn: anghammaradSnsTopic,
		threadKey: anghammaradThreadKey(fullRepoName),
	});
}
