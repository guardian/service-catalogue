import type {
	github_repositories,
	PrismaClient,
	repocop_github_repository_rules,
} from '@prisma/client';
import { getPrismaClient } from 'common/database';
import { stageAwareOctokit } from 'common/functions';
import { getConfig } from './config';
import { getUnarchivedRepositories } from './query';
import { protectBranches } from './remediations/branch-protector/branch-protection';
import { sendPotentialInteractives } from './remediations/repository-06-topic-monitor-interactive';
import { findReposInProdWithoutProductionTopic } from './remediations/repository-06-topic-monitor-production';
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

export async function main() {
	const config = await getConfig();
	const prisma = getPrismaClient(config);

	const unarchivedRepositories: github_repositories[] =
		await getUnarchivedRepositories(prisma, config.ignoredRepositoryPrefixes);

	const evaluatedRepos: repocop_github_repository_rules[] =
		await evaluateRepositories(prisma, unarchivedRepositories);

	await writeEvaluationTable(evaluatedRepos, prisma);
	if (config.enableMessaging) {
		await sendPotentialInteractives(evaluatedRepos, config);
		const octokit = await stageAwareOctokit(config.stage);
		await protectBranches(
			prisma,
			evaluatedRepos,
			config,
			unarchivedRepositories,
			octokit,
		);
	} else {
		console.log(
			'Messaging is not enabled. Set ENABLE_MESSAGING flag to enable.',
		);
	}

	await findReposInProdWithoutProductionTopic(prisma, unarchivedRepositories);

	console.log('Done');
}
