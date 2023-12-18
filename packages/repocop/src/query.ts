import type {
	github_repository_branches,
	PrismaClient,
	snyk_projects,
	view_repo_ownership,
} from '@prisma/client';
import type {
	AwsCloudFormationStack,
	Repository,
	Team,
	TeamRepository,
} from './types';

export async function getRepositories(
	client: PrismaClient,
	ignoredRepositoryPrefixes: string[],
): Promise<Repository[]> {
	console.log('Discovering repositories');
	const repositories = await client.github_repositories.findMany({
		where: {
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
	return repositories.map((r) => r as Repository);
}

// We only care about branches from repos we've selected, so lets only pull those to save us some time/memory
export async function getRepositoryBranches(
	client: PrismaClient,
	repos: Repository[],
): Promise<github_repository_branches[]> {
	const branches = await client.github_repository_branches.findMany({
		where: {
			repository_id: { in: repos.map((repo) => repo.id) },
		},
	});

	return branches;
}

export const getTeams = async (client: PrismaClient): Promise<Team[]> => {
	const teams = (await client.github_teams.findMany({})).map((t) => t as Team);
	console.log(`Parsed ${teams.length} teams.`);
	return teams;
};

export async function getRepositoryTeams(
	client: PrismaClient,
): Promise<TeamRepository[]> {
	const data = await client.github_team_repositories.findMany({});
	return data.map((t) => t as TeamRepository);
}

export async function getRepoOwnership(
	client: PrismaClient,
): Promise<view_repo_ownership[]> {
	const data = await client.view_repo_ownership.findMany();
	console.log(`Found ${data.length} repo ownership records.`);
	return data;
}

export async function getStacks(
	client: PrismaClient,
): Promise<AwsCloudFormationStack[]> {
	return (await client.aws_cloudformation_stacks.findMany({})).map(
		(stack) => stack as AwsCloudFormationStack,
	);
}

export async function getSnykProjects(
	client: PrismaClient,
): Promise<snyk_projects[]> {
	return await client.snyk_projects.findMany({});
}
