import { PrismaClient } from '@prisma/client';
import type {
	github_teams,
	repocop_github_repository_rules,
	view_repo_ownership,
} from '@prisma/client';
import { getConfig } from './config';
import { getRepoOwnership, getTeams } from './query';
import { evaluateRepositories } from './rules/repository';

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

	const reposWithoutBranchProtection = data.filter(
		(repo) => !repo.repository_02,
	);

	const repoOwners = await getRepoOwnership(prisma);

	function findTeamSlugFromId(
		id: bigint,
		teams: github_teams[],
	): string | undefined {
		const match: github_teams | undefined = teams.find(
			(team) => team.id === id,
		);
		return match?.slug ?? undefined;
	}

	const teams = await getTeams(prisma);

	//for every repo without branch protection, get a list of owners from repoOwners like so  { repo: 'repo', owners: ['owner1', 'owner2'] }
	const repo04WithContactableOwners = reposWithoutBranchProtection
		.map((repo) => {
			const owners: view_repo_ownership[] = repoOwners.filter(
				(owner) => owner.full_name === repo.full_name,
			);
			return {
				fullName: repo.full_name,
				teamNameSlugs: owners
					.map((owner) => findTeamSlugFromId(owner.github_team_id, teams))
					.filter((slug): slug is string => !!slug),
			};
		})
		.filter((repo) => repo.teamNameSlugs.length > 0);

	console.log('Clearing the table');
	await prisma.repocop_github_repository_rules.deleteMany({});

	console.log(`Writing ${data.length} records to table`);
	await prisma.repocop_github_repository_rules.createMany({
		data,
	});

	console.log('Done');
}
