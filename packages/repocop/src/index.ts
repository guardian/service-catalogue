import type {
	PrismaClient,
	repocop_github_repository_rules,
} from '@prisma/client';
import { getPrismaClient } from 'common/database';
import { partition, stageAwareOctokit } from 'common/functions';
import type { AWSCloudformationStack } from 'common/types';
import type { Config } from './config';
import { getConfig } from './config';
import {
	getRepositories,
	getRepositoryBranches,
	getRepositoryTeams,
	getStacks,
} from './query';
import { protectBranches } from './remediations/branch-protector/branch-protection';
import { sendPotentialInteractives } from './remediations/topics/topic-monitor-interactive';
import { applyProductionTopicAndMessageTeams } from './remediations/topics/topic-monitor-production';
import { evaluateRepositories, findStacks } from './rules/repository';
import type { RepoAndStack, Repository } from './types';

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

function findArchivedReposWithStacks(
	archivedRepositories: Repository[],
	unarchivedRepositories: Repository[],
	stacks: AWSCloudformationStack[],
) {
	const archivedRepos = archivedRepositories;
	const unarchivedRepos = unarchivedRepositories;

	const stacksWithoutAnUnarchivedRepoMatch: AWSCloudformationStack[] =
		stacks.filter((stack) =>
			unarchivedRepos.some((repo) => !(repo.full_name === stack.guRepoName)),
		);

	const archivedReposWithPotentialStacks: RepoAndStack[] = archivedRepos
		.map((repo) => findStacks(repo, stacksWithoutAnUnarchivedRepoMatch))
		.filter((result) => result.stacks.length > 0);

	return archivedReposWithPotentialStacks;
}

export async function main() {
	const config: Config = await getConfig();
	const prisma = getPrismaClient(config);

	const [unarchivedRepos, archivedRepos] = partition(
		await getRepositories(prisma, config.ignoredRepositoryPrefixes),
		(repo) => !repo.archived,
	);
	const branches = await getRepositoryBranches(prisma, unarchivedRepos);
	const teams = await getRepositoryTeams(prisma);
	const nonPlaygroundStacks: AWSCloudformationStack[] = (
		await getStacks(prisma)
	).filter((s) => s.tags['Stack'] !== 'playground');

	const evaluatedRepos: repocop_github_repository_rules[] =
		evaluateRepositories(unarchivedRepos, branches, teams);

	const unmaintinedReposCount = evaluatedRepos.filter(
		(repo) => repo.archiving === false,
	).length;

	console.log(
		`Found ${unmaintinedReposCount} unmaintained repositories of ${unarchivedRepos.length}.`,
	);

	const archivedWithStacks = findArchivedReposWithStacks(
		archivedRepos,
		unarchivedRepos,
		nonPlaygroundStacks,
	);

	console.log(`Found ${archivedWithStacks.length} archived repos with stacks.`);

	console.log(
		'Archived repos with live stacks, first 10 results:',
		archivedWithStacks.slice(0, 10),
	);

	await writeEvaluationTable(evaluatedRepos, prisma);
	if (config.enableMessaging) {
		await sendPotentialInteractives(evaluatedRepos, config);
		const octokit = await stageAwareOctokit(config.stage);
		await protectBranches(
			prisma,
			evaluatedRepos,
			config,
			unarchivedRepos,
			octokit,
		);
		await applyProductionTopicAndMessageTeams(
			prisma,
			unarchivedRepos,
			nonPlaygroundStacks,
			octokit,
			config,
		);
	} else {
		console.log(
			'Messaging is not enabled. Set ENABLE_MESSAGING flag to enable.',
		);
	}

	console.log('Done');
}
