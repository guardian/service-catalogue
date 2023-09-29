import { PrismaClient } from '@prisma/client';
import type { repocop_github_repository_rules } from '@prisma/client';
import { getConfig } from './config';
import {
	getRepoOwnership,
	getRepositoryBranches,
	getRepositoryTeams,
	getUnarchivedRepositories,
} from './query';
import { repositoryRuleEvaluation } from './rules/repository';

export async function evaluateRepositories(
	client: PrismaClient,
	ignoredRepositoryPrefixes: string[],
): Promise<repocop_github_repository_rules[]> {
	const repositories = await getUnarchivedRepositories(
		client,
		ignoredRepositoryPrefixes,
	);

	const branches = await getRepositoryBranches(client, repositories);

	return await Promise.all(
		repositories.map(async (repo) => {
			const teams = await getRepositoryTeams(client, repo);
			return repositoryRuleEvaluation(repo, branches, teams);
		}),
	);
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

	// We're not doing anything with this data, this is just to demonstrate we can interact with SQL views using Prisma.
	await getRepoOwnership(prisma);

	const data = await evaluateRepositories(
		prisma,
		config.ignoredRepositoryPrefixes,
	);

	console.log('Clearing the table');
	await prisma.repocop_github_repository_rules.deleteMany({});

	console.log(`Writing ${data.length} records to table`);
	await prisma.repocop_github_repository_rules.createMany({
		data,
	});

	console.log('Done');
}
