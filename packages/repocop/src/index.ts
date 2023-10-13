import type { repocop_github_repository_rules } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { getConfig } from './config';
import { getRepoOwnership, getTeams, getUnarchivedRepositories } from './query';
import type { UpdateBranchProtectionEvent } from './remediations/repository-02';
import { createRepository02Messages } from './remediations/repository-02';
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
async function writeRepo02Messages(
	prisma: PrismaClient,
	evaluatedRepos: repocop_github_repository_rules[],
) {
	const repoOwners = await getRepoOwnership(prisma);
	const teams = await getTeams(prisma);

	//repos with a 'production' or 'documentation' topic
	const productionOrDocs = (await getUnarchivedRepositories(prisma, []))
		.filter(
			(repo) =>
				repo.topics.includes('production') ||
				repo.topics.includes('documentation'),
		)
		.map((repo) => repo.full_name);

	const relevantRepos = evaluatedRepos.filter((repo) =>
		productionOrDocs.includes(repo.full_name),
	);

	const msgs = createRepository02Messages(relevantRepos, repoOwners, teams);
	await notifyAndAddToQueue(msgs);
}

async function notifyAndAddToQueue(events: UpdateBranchProtectionEvent[]) {
	// TODO - implement this
	console.log('Function not implemented, here are the events:');
	for (const event of events) {
		console.log(event);
	}

	return Promise.resolve();
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

	const evaluatedRepos: repocop_github_repository_rules[] =
		await evaluateRepositories(prisma, config.ignoredRepositoryPrefixes);

	await writeEvaluationTable(evaluatedRepos, prisma);
	await writeRepo02Messages(prisma, evaluatedRepos);

	console.log('Done');
}
