import { PrismaClient } from '@prisma/client';
import { getConfig } from './config';
import { getRepoOwnership, getTeams } from './query';
import { findContactableOwners } from './remediations/repository-04';
import { evaluateRepositories } from './rules/repository';

const shuffle = (array: unknown[]): unknown[] => {
	return array.sort(() => Math.random() - 0.5);
};

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

	const evaluatedRepos = await evaluateRepositories(
		prisma,
		config.ignoredRepositoryPrefixes,
	);

	const reposWithoutBranchProtection = evaluatedRepos.filter(
		(repo) => !repo.repository_02,
	);

	const repoOwners = await getRepoOwnership(prisma);

	const teams = await getTeams(prisma);

	const repo04WithContactableOwners = reposWithoutBranchProtection
		.map((repo) => {
			return {
				fullName: repo.full_name,
				teamNameSlugs: findContactableOwners(repo.full_name, repoOwners, teams),
			};
		})
		.filter((repo) => repo.teamNameSlugs.length > 0);

	const allOrFirstFive = Math.min(repo04WithContactableOwners.length, 5);

	shuffle(repo04WithContactableOwners).slice(0, allOrFirstFive);

	console.log('Clearing the table');
	await prisma.repocop_github_repository_rules.deleteMany({});

	console.log(`Writing ${evaluatedRepos.length} records to table`);
	await prisma.repocop_github_repository_rules.createMany({
		data: evaluatedRepos,
	});

	console.log('Done');
}
