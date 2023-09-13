import type { github_repositories, Prisma, PrismaClient } from '@prisma/client';
import type { GetFindResult } from '@prisma/client/runtime/library';

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
