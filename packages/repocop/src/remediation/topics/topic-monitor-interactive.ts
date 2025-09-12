import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import type { repocop_github_repository_rules } from 'common/generated/prisma/client.js';
import { awsClientConfig } from 'common/src/aws.js';
import { shuffle } from 'common/src/functions.js';
import type { Config } from '../../config.js';
import { removeRepoOwner } from '../shared-utilities.js';

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
	const potentialInteractives: string[] = shuffle(
		findPotentialInteractives(evaluatedRepos),
	)
		.map((repo) => removeRepoOwner(repo))
		.filter((repo) => repo !== '');

	const snsBatchMaximum = Math.min(
		potentialInteractives.length,
		config.interactivesCount,
	);

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
