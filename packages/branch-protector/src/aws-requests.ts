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
	const deleteCommand = new DeleteMessageCommand({
		QueueUrl: config.queueUrl,
		ReceiptHandle: message.ReceiptHandle,
	});

	await sqs.send(deleteCommand);

	console.log(`Deleted message ${message.MessageId ?? 'unknown'}`);
}

export async function notify(
	fullRepoName: string,
	topicArn: string,
	slug: string,
) {
	const repoUrl = `https://github.com/${fullRepoName}`;
	const grafanaUrl = `https://metrics.gutools.co.uk/d/EOPnljWIz/repocop-compliance?var-team=${slug}&var-rule=All&orgId=1`;
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
		subject: 'Repocop branch protection',
		message: `Branch protection has been applied to ${fullRepoName}`,
		actions,
		target: { GithubTeamSlug: slug },
		channel: RequestedChannel.PreferHangouts,
		sourceSystem: 'branch-protector',
		topicArn: topicArn,
	});
}
