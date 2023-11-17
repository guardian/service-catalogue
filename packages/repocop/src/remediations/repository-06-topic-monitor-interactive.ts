import {
	PublishBatchCommand,
	type PublishBatchCommandInput,
	type PublishBatchRequestEntry,
	SNSClient,
} from '@aws-sdk/client-sns';
import type { repocop_github_repository_rules } from '@prisma/client';
import { getLocalProfile, shuffle } from 'common/functions';
import type { Config } from '../config';

export function findPotentialInteractives(
	evaluatedRepos: repocop_github_repository_rules[],
): string[] {
	return evaluatedRepos
		.filter((repo) => !repo.topics)
		.map((repo) => repo.full_name);
}

export function createBatchEntry(string: string): PublishBatchRequestEntry {
	const shortString = string.split('/')[1];
	if (!shortString) {
		throw new Error(`Invalid repo name: ${string}`);
	}
	return {
		Id: shortString.replace(/\W/g, ''),
		Message: shortString,
	};
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
	await new SNSClient({
		region: config.region,
		credentials: getLocalProfile(config.stage),
	}).send(cmd);
}
