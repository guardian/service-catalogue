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
