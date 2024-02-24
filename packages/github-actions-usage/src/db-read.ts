import type { PrismaClient } from '@prisma/client';

/**
 * A record read from the database.
 *
 * Field names _must_ match the column names in the database query.
 */
export interface ReadDatabaseRow {
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
export function getWorkflows(client: PrismaClient): Promise<ReadDatabaseRow[]> {
	return client.$queryRaw<ReadDatabaseRow[]>`
		SELECT repo.full_name
				 , workflow.path
				 , workflow.contents
		FROM github_workflows AS workflow
	 		JOIN github_repositories repo 
	 	    ON workflow.repository_id = repo.id
		WHERE workflow.contents IS NOT NULL;
	`;
}
