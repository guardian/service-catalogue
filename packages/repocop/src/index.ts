import type {
	github_repositories,
	PrismaClient,
	repocop_github_repository_rules,
} from '@prisma/client';
import { getPrismaClient } from 'common/database';
import { partition, stageAwareOctokit } from 'common/functions';
import type { AWSCloudformationStack } from 'common/types';
import type { Config } from './config';
import { getConfig } from './config';
import { getRepositories, getStacks } from './query';
import { protectBranches } from './remediations/branch-protector/branch-protection';
import { sendPotentialInteractives } from './remediations/repository-06-topic-monitor-interactive';
import { applyProductionTopicAndMessageTeams } from './remediations/repository-06-topic-monitor-production';
import { parseTagsFromStack } from './remediations/shared-utilities';
import { evaluateRepositories, findStacks } from './rules/repository';
import type { RepoAndArchiveStatus, RepoAndStack } from './types';

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

function toRepoAndArchiveStatus(
	repo: github_repositories,
): RepoAndArchiveStatus | undefined {
	if (!repo.archived || !repo.name || !repo.full_name) {
		return undefined;
	} else {
		return {
			archived: repo.archived,
			name: repo.name,
			fullName: repo.full_name,
		};
	}
}

async function findArchivedReposWithStacks(
	prisma: PrismaClient,
	archivedRepositories: github_repositories[],
	unarchivedRepositories: github_repositories[],
) {
	const stacks = (await getStacks(prisma))
		.map((s) => parseTagsFromStack(s))
		.filter((s) => !(s.tags['Stack'] !== 'playground')); //ignore playground stacks for now.

	const archivedRepos: RepoAndArchiveStatus[] = archivedRepositories.map(
		(repo) => toRepoAndArchiveStatus(repo),
	) as RepoAndArchiveStatus[];
	const unarchivedRepos = unarchivedRepositories.map((repo) =>
		toRepoAndArchiveStatus(repo),
	) as RepoAndArchiveStatus[];

	const stacksWithoutAnUnarchivedRepoMatch: AWSCloudformationStack[] =
		stacks.filter((stack) =>
			unarchivedRepos.some((repo) => !(repo.fullName === stack.guRepoName)),
		);

	const archivedReposWithPotentialStacks: RepoAndStack[] = archivedRepos
		.map((repo) => findStacks(repo, stacksWithoutAnUnarchivedRepoMatch))
		.filter((result) => result.stacks.length > 0);

	return archivedReposWithPotentialStacks;
}

export async function main() {
	const config: Config = await getConfig();
	const prisma = getPrismaClient(config);

	const [unarchivedRepositories, archivedRepositories] = partition(
		await getRepositories(prisma, config.ignoredRepositoryPrefixes),
		(repo) => !repo.archived,
	);

	const evaluatedRepos: repocop_github_repository_rules[] =
		await evaluateRepositories(prisma, unarchivedRepositories);

	const unmaintinedReposCount = evaluatedRepos.filter(
		(repo) => repo.archiving === false,
	).length;

	console.log(
		`Found ${unmaintinedReposCount} unmaintained repositories of ${unarchivedRepositories.length}.`,
	);

	const archivedWithStacks = await findArchivedReposWithStacks(
		prisma,
		archivedRepositories,
		unarchivedRepositories,
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
			unarchivedRepositories,
			octokit,
		);
		await applyProductionTopicAndMessageTeams(
			prisma,
			unarchivedRepositories,
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
