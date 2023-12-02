import type {
	aws_cloudformation_stacks,
	github_repositories,
	github_repository_branches,
	github_teams,
	Prisma,
	PrismaClient,
	view_repo_ownership,
} from '@prisma/client';
import type { GetFindResult } from '@prisma/client/runtime/library';
import type {
	AWSCloudformationStack,
	AWSCloudformationTag,
} from 'common/types';

export async function getRepositories(
	client: PrismaClient,
	ignoredRepositoryPrefixes: string[],
) {
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

	return repositories;
}

export async function getUnarchivedRepositories(
	client: PrismaClient,
	ignoredRepositoryPrefixes: string[],
): Promise<github_repositories[]> {
	const repositories = (
		await getRepositories(client, ignoredRepositoryPrefixes)
	).filter((r) => !r.archived);
	console.log(`Found ${repositories.length} unarchived repositories`);

	return repositories;
}

export async function getArchivedRepositories(
	client: PrismaClient,
	ignoredRepositoryPrefixes: string[],
): Promise<github_repositories[]> {
	const repositories = (
		await getRepositories(client, ignoredRepositoryPrefixes)
	).filter((r) => r.archived);
	console.log(`Found ${repositories.length} archived repositories`);

	return repositories;
}

// We only care about branches from repos we've selected, so lets only pull those to save us some time/memory
export async function getRepositoryBranches(
	client: PrismaClient,
	repos: github_repositories[],
): Promise<github_repository_branches[]> {
	const branches = await client.github_repository_branches.findMany({
		where: {
			repository_id: { in: repos.map((repo) => repo.id) },
		},
	});

	return branches;
}

export const getTeams = async (client: PrismaClient): Promise<github_teams[]> =>
	await client.github_teams.findMany({});

export type RepositoryTeam = GetFindResult<
	Prisma.$github_team_repositoriesPayload,
	{
		select: { role_name: boolean; id: boolean };
		where: { id: bigint };
	}
>;

export async function getRepositoryTeams(
	client: PrismaClient,
	repository: github_repositories,
): Promise<RepositoryTeam[]> {
	const data: RepositoryTeam[] = await client.github_team_repositories.findMany(
		{
			select: {
				id: true,
				role_name: true,
			},
			where: {
				id: repository.id,
			},
		},
	);

	return data;
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
): Promise<aws_cloudformation_stacks[]> {
	return await client.aws_cloudformation_stacks.findMany({});
}

export async function findProdCfnStacks(
	client: PrismaClient,
): Promise<AWSCloudformationStack[]> {
	const cfnStacks = await client.aws_cloudformation_stacks.findMany({
		where: {
			OR: [
				{
					tags: {
						path: ['Stage'],
						equals: 'PROD',
					},
				},
				{
					tags: {
						path: ['Stage'],
						equals: 'INFRA',
					},
				},
			],
			AND: [
				{
					tags: {
						path: ['gu:repo'],
						string_starts_with: 'guardian/',
					},
				},
			],
			NOT: [
				{
					tags: {
						path: ['Stack'],
						equals: 'playground', // we are filtering out Developer Playground repos for now as they shouldn't be in production anyway - Cloudformation stacks with a Stack tag of 'playground' get deployed into the Developer Playground account
					},
				},
			],
		},
		select: {
			tags: true,
			stack_name: true,
			creation_time: true,
		},
	});

	const stacks = cfnStacks.map((stack) => ({
		stackName: stack.stack_name,
		tags: stack.tags as AWSCloudformationTag,
		creationTime: stack.creation_time,
	}));

	return stacks;
}
