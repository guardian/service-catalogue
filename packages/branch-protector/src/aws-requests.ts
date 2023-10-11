import { ReceiveMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import type { Config } from './config';
import type { UpdateBranchProtectionEvent } from './model';

export async function getEvents(
	msgCount: number,
	config: Config,
): Promise<UpdateBranchProtectionEvent[]> {
	const command = new ReceiveMessageCommand({
		QueueUrl: config.queueUrl,
		MaxNumberOfMessages: msgCount,
		WaitTimeSeconds: 20,
	});

	const sqsClient = new SQSClient({});

	const result = await sqsClient.send(command);
	if (result.Messages === undefined) {
		console.log('No messages found');
		return [];
	} else {
		const messages = result.Messages.map((msg) => msg.Body)
			.filter((msg): msg is string => !!msg)
			.map((msg) => JSON.parse(msg) as UpdateBranchProtectionEvent);
		return messages;
	}
}

export async function notify(
	fullRepoName: string,
	topicArn: string,
	slug: string,
) {
	const client = new Anghammarad();
	await client.notify({
		subject: 'Hello',
		message: `Branch protection has been applied to ${fullRepoName}`,
		actions: [
			{
				cta: 'Check branch protections here',
				url: `https://github.com/${fullRepoName}/settings/branches`,
			},
		],
		target: { GithubTeamSlug: slug },
		channel: RequestedChannel.PreferHangouts,
		sourceSystem: 'branch-protector',
		topicArn: topicArn,
	});
}
