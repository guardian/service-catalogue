import {
	PublishBatchCommand,
	type PublishBatchCommandInput,
	type PublishBatchRequestEntry,
	SNSClient,
} from '@aws-sdk/client-sns';
import { Anghammarad } from '@guardian/anghammarad';
import type {
	github_repositories,
	repocop_github_repository_rules,
} from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { getLocalProfile, shuffle } from 'common/src/functions';
import type { UpdateMessageEvent } from 'common/types';
import type { Config } from './config';
import { getConfig } from './config';
import { getUnarchivedRepositories } from './query';
import {
	notifyAnghammaradBranchProtection,
	notifyBranchProtector,
} from './remediations/repository-02-branch_protection';
import {
	createBatchEntry,
	findPotentialInteractives,
} from './remediations/repository-06-topic-monitor-interactive';
import { evaluateRepositories } from './rules/repository';

async function writeEvaluationTable(
	evaluatedRepos: repocop_github_repository_rules[],
	prisma: PrismaClient,
) {
	console.log('Clearing the table');
	await prisma.repocop_github_repository_rules.deleteMany({});

	console.log(`Writing ${evaluatedRepos.length} records to table`);
	await prisma.repocop_github_repository_rules.createMany({
		data: evaluatedRepos,
	});

	console.log('Finished writing to table');
}

async function sendPotentialInteractives(
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

export async function main() {
	const config = await getConfig();
	const prisma = new PrismaClient({
		datasources: {
			db: {
				url: config.databaseConnectionString,
			},
		},
		...(config.withQueryLogging && {
			log: [
				{
					emit: 'stdout',
					level: 'query',
				},
			],
		}),
	});

	const unarchivedRepositories: github_repositories[] =
		await getUnarchivedRepositories(prisma, config.ignoredRepositoryPrefixes);

	const evaluatedRepos: repocop_github_repository_rules[] =
		await evaluateRepositories(prisma, unarchivedRepositories);

	await writeEvaluationTable(evaluatedRepos, prisma);
	if (config.enableMessaging) {
		await sendPotentialInteractives(evaluatedRepos, config);
		const msgs: UpdateMessageEvent[] = await notifyBranchProtector(
			prisma,
			evaluatedRepos,
			config,
			unarchivedRepositories,
		);
		if (config.stage === 'PROD') {
			const anghammaradClient = new Anghammarad();
			await notifyAnghammaradBranchProtection(msgs, config, anghammaradClient);
		}
	} else {
		console.log(
			'Messaging is not enabled. Set ENABLE_MESSAGING flag to enable.',
		);
	}

	console.log('Done');
}
