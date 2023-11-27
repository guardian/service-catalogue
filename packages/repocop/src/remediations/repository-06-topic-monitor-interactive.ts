import {
	PublishBatchCommand,
	type PublishBatchCommandInput,
	type PublishBatchRequestEntry,
	PublishCommand,
	SNSClient,
} from '@aws-sdk/client-sns';
import type { repocop_github_repository_rules } from '@prisma/client';
import { awsClientConfig } from 'common/src/aws';
import { shuffle } from 'common/src/functions';
import type { Config } from '../config';

export function findPotentialInteractives(
	evaluatedRepos: repocop_github_repository_rules[],
): string[] {
	return evaluatedRepos
		.filter((repo) => !repo.topics)
		.map((repo) => repo.full_name);
}

export async function sendPotentialInteractives(
	evaluatedRepos: repocop_github_repository_rules[],
	config: Config,
) {
	const potentialInteractives = shuffle(
		findPotentialInteractives(evaluatedRepos),
	);
	const snsBatchMaximum = Math.min(potentialInteractives.length, 10);
	const somePotentialInteractives = potentialInteractives.slice(
		0,
		snsBatchMaximum,
	);

	console.log(
		`Found ${potentialInteractives.length} potential interactives of ${evaluatedRepos.length} evaluated repositories`,
	);

	const publishRequestEntry = new PublishCommand({
		Message: JSON.stringify(somePotentialInteractives),
		TopicArn: config.interactiveMonitorSnsTopic,
	});

	const strList = somePotentialInteractives.join(', ');
	console.log(
		`Sending ${snsBatchMaximum} potential interactives to SNS. ${strList}`,
	);
	await new SNSClient(awsClientConfig(config.stage)).send(publishRequestEntry);
}
