import type {
	github_repositories,
	github_repository_branches,
	github_team_repositories,
	repocop_github_repository_rules,
} from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { getConfig } from './config';
import { repositoryRuleEvaluation } from './rules/repository';

async function getRepositories(
	client: PrismaClient,
	ignoredRepositoryPrefixes: string[],
): Promise<github_repositories[]> {
	console.log('Discovering repositories');
	const repositories = await client.github_repositories.findMany({
		where: {
			archived: false,

			NOT: [
				{
					OR: ignoredRepositoryPrefixes.map((prefix) => {
						return { full_name: { startsWith: prefix } };
					}),
				},
			],
		},
	});
	console.log(`Found ${repositories.length} repositories`);

	return repositories;
}

async function getRepositoryBranches(
	client: PrismaClient,
	repository: github_repositories,
): Promise<github_repository_branches[]> {
	const branches = await client.github_repository_branches.findMany({
		where: {
			repository_id: repository.id,
		},
	});

	// `full_name` is typed as nullable, in reality it is not, so the fallback to `id` shouldn't happen
	const repoIdentifier = repository.full_name ?? repository.id;

	console.log(
		`Found ${branches.length} branches for repository ${repoIdentifier}`,
	);

	return branches;
}

async function getRepositoryTeams(
	client: PrismaClient,
	repository: github_repositories,
): Promise<github_team_repositories[]> {
	const data = await client.github_team_repositories.findMany({
		where: {
			id: repository.id,
		},
	});

	// `full_name` is typed as nullable, in reality it is not, so the fallback to `id` shouldn't happen
	const repoIdentifier = repository.full_name ?? repository.id;

	console.log(
		`Found ${data.length} teams with access to repository ${repoIdentifier}`,
	);

	return data;
}

async function evaluateRepositories(
	client: PrismaClient,
	ignoredRepositoryPrefixes: string[],
): Promise<repocop_github_repository_rules[]> {
	const repositories = await getRepositories(client, ignoredRepositoryPrefixes);

	return await Promise.all(
		repositories.map(async (repo) => {
			const branches = await getRepositoryBranches(client, repo);
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
