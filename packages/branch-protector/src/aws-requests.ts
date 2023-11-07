import type { Message, SQSClient } from '@aws-sdk/client-sqs';
import {
	DeleteMessageCommand,
	ReceiveMessageCommand,
} from '@aws-sdk/client-sqs';
import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
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
	console.log(`Attempting to delete ${messageId} from queue`);
	const deleteCommand = new DeleteMessageCommand({
		QueueUrl: config.queueUrl,
		ReceiptHandle: message.ReceiptHandle,
	});

	try {
		await sqs.send(deleteCommand);
		console.log(`Deleted message ${messageId}`);
	} catch (error) {
		console.error(`Error: delete command failed for ${messageId}`);
		console.error(error);
	}
}

export async function notify(
	fullRepoName: string,
	config: Config,
	teamSlug: string,
) {
	const { app, stage, anghammaradSnsTopic } = config;

	const repoUrl = `https://github.com/${fullRepoName}`;
	const grafanaUrl = `https://metrics.gutools.co.uk/d/EOPnljWIz/repocop-compliance?var-team=${teamSlug}&var-rule=All&orgId=1`;
	const protectionUrl = `https://github.com/${fullRepoName}/settings/branches`;
	const actions = [
		//duplicated in repocop
		{ cta: 'Repository', url: repoUrl },
		{
			cta: 'Compliance information for repos',
			url: grafanaUrl,
		},
		{
			cta: 'Branch protections',
			url: protectionUrl,
		},
	];

	const client = new Anghammarad();
	await client.notify({
		subject: `Repocop branch protection (for GitHub team ${teamSlug})`,
		message: `Branch protection has been applied to ${fullRepoName}`,
		actions,
		target: { GithubTeamSlug: teamSlug },
		channel: RequestedChannel.PreferHangouts,
		sourceSystem: `${app} ${stage}`,
		topicArn: anghammaradSnsTopic,
		threadKey: `service-catalogue-${fullRepoName.replaceAll('/', '-')}`,
	});
}
