import type { PrismaClient } from 'common/prisma-client/client.js';

/**
 * A record read from the database.
 *
 * Field names _must_ match the column names in the database query.
 */
export interface RawGithubWorkflow {
	full_name: string;
	path: string;
	contents: string;
}

/**
 * Get all GitHub workflows, and the repository they belong to.
 * The repository full name takes the form of `owner/repo`.
 *
 * Empty workflows are not returned, as these represent workflows that have been deleted.
 * @see https://github.com/cloudquery/cloudquery/blob/main/plugins/source/github/resources/services/actions/workflows.go
 */
export function getWorkflows(
	client: PrismaClient,
): Promise<RawGithubWorkflow[]> {
	/*
	There is no foreign key constraint between the `github_workflows`,
	and `github_repositories` tables.
	Therefore, we can't use Prisma's `include` to join the tables.

	Instead, use Prisma's `$queryRaw` to extract the data.
	Prisma still provides type safety and query building.

	An alternative would be to select all the workflows,
	then select the repositories in a separate query, and join in memory.
	 */
	return client.$queryRaw<RawGithubWorkflow[]>`
		SELECT repo.full_name
				 , workflow.path
				 , workflow.contents
		FROM github_workflows AS workflow
	 		JOIN github_repositories repo 
	 	    ON workflow.repository_id = repo.id
		WHERE workflow.contents IS NOT NULL;
	`;
}
