import {
	PublishBatchCommand,
	type PublishBatchCommandInput,
	type PublishBatchRequestEntry,
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

export function createBatchEntry(
	fullRepoName: string,
): PublishBatchRequestEntry {
	const shortName = fullRepoName.split('/')[1];
	if (!shortName) {
		throw new Error(`Invalid repo name: ${fullRepoName}`);
	}
	return {
		Id: shortName.replace(/\W/g, ''),
		Message: shortName,
	};
}

export async function sendPotentialInteractives(
	evaluatedRepos: repocop_github_repository_rules[],
	config: Config,
) {
	const potentialInteractives = shuffle(
		findPotentialInteractives(evaluatedRepos),
	);
	const snsBatchMaximum = Math.min(
		potentialInteractives.length,
		config.stage === 'PROD' ? 5 : 1,
	);
	const somePotentialInteractives = potentialInteractives.slice(
		0,
		snsBatchMaximum,
	);

	console.log(
		`Found ${potentialInteractives.length} potential interactives of ${evaluatedRepos.length} evaluated repositories`,
	);

	const PublishBatchRequestEntries = somePotentialInteractives.map(
		(repo): PublishBatchRequestEntry => createBatchEntry(repo),
	);

	const batchCommandInput: PublishBatchCommandInput = {
		TopicArn: config.interactiveMonitorSnsTopic,
		PublishBatchRequestEntries,
	};

	const strList = somePotentialInteractives.join(', ');
	console.log(
		`Sending ${snsBatchMaximum} potential interactives to SNS. ${strList}`,
	);
	const cmd = new PublishBatchCommand(batchCommandInput);
	await new SNSClient(awsClientConfig(config.stage)).send(cmd);
}
