import type {
	github_repositories,
	PrismaClient,
	repocop_github_repository_rules,
} from '@prisma/client';
import { getPrismaClient } from 'common/database';
import { stageAwareOctokit } from 'common/functions';
import type { AWSCloudformationStack } from 'common/types';
import type { Config } from './config';
import { getConfig } from './config';
import { getRepositories, getStacks, getUnarchivedRepositories } from './query';
import { protectBranches } from './remediations/branch-protector/branch-protection';
import { sendPotentialInteractives } from './remediations/repository-06-topic-monitor-interactive';
import { applyProductionTopicAndMessageTeams } from './remediations/repository-06-topic-monitor-production';
import { parseTagsFromStack } from './remediations/shared-utilities';
import type { RepoAndArchiveStatus } from './rules/repository';
import { evaluateRepositories, findStacks } from './rules/repository';

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
			full_name: repo.full_name,
		};
	}
}

async function findArchivedReposWithStacks(
	prisma: PrismaClient,
	config: Config,
) {
	const allRepos = (
		await getRepositories(prisma, config.ignoredRepositoryPrefixes)
	)
		.map((r) => toRepoAndArchiveStatus(r))
		.filter((r) => !!r) as RepoAndArchiveStatus[];

	const stacks = (await getStacks(prisma))
		.map((s) => parseTagsFromStack(s))
		.filter((s) => !(s.tags['Stack'] !== 'playground')); //ignore playground stacks for now.

	const archivedRepos = allRepos.filter((repo) => repo.archived);
	const unarchivedRepos = allRepos.filter((repo) => !repo.archived);

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
	const config = await getConfig();
	const prisma = getPrismaClient(config);

	const unarchivedRepositories: github_repositories[] =
		await getUnarchivedRepositories(prisma, config.ignoredRepositoryPrefixes);

	const evaluatedRepos: repocop_github_repository_rules[] =
		await evaluateRepositories(prisma, unarchivedRepositories);

	const unmaintinedReposCount = evaluatedRepos.filter(
		(repo) => repo.archiving === false,
	).length;

	console.log(
		`Found ${unmaintinedReposCount} unmaintained repositories of ${unarchivedRepositories.length}.`,
	);

	console.log(
		'Archived repos with potentially active stacks:',
		(await findArchivedReposWithStacks(prisma, config)).slice(0, 10),
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
