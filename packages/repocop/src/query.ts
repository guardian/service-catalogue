import type {
	github_repositories,
	github_repository_branches,
	Prisma,
	PrismaClient,
} from '@prisma/client';
import type { GetFindResult } from '@prisma/client/runtime/library';

export async function getRepositories(
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

export async function getRepositoryBranches(
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

	// `full_name` is typed as nullable, in reality it is not, so the fallback to `id` shouldn't happen
	const repoIdentifier = repository.full_name ?? repository.id;

	console.log(
		`Found ${data.length} teams with access to repository ${repoIdentifier}`,
	);

	return data;
}
