/**
 * Calls a createMany-style function only when there is data to persist.
 */
import type { Prisma } from 'common/prisma-client/client.js';

export type RoleName = 'triage' | 'read' | 'maintain' | 'write' | 'admin';
export type TeamSlug = 'frontend' | 'backend' | 'devops' | 'cricket';

/** Declarative definition for a seeded repository fixture. */
export interface RepoDefinition {
	id: number;
	name: string;
	languages: readonly string[];
	owners: ReadonlyArray<{ teamSlug: TeamSlug; roleName: RoleName }>;
	githubActionsUses: readonly string[];
	cloudFormation?: boolean;
	customProperties?: boolean;
	workflowPath?: string;
}

/** Persisted seed payload assembled before insertion into the database. */
export interface GitHubSeedData {
	repos: Prisma.github_repositoriesCreateManyInput[];
	languages: Prisma.github_languagesCreateManyInput[];
	branches: Prisma.github_repository_branchesCreateManyInput[];
	teamRepos: Prisma.github_team_repositoriesCreateManyInput[];
	cloudFormationStacks: Prisma.aws_cloudformation_stacksCreateManyInput[];
	githubWorkflows: Prisma.github_workflowsCreateManyInput[];
	githubActionsUsages: Prisma.guardian_github_actions_usageCreateManyInput[];
	customProperties: Prisma.github_repository_custom_propertiesCreateManyInput[];
}

/** Repository row plus directly derived child rows created during assembly. */
export interface RepoBundle {
	repositoryId: bigint;
	repo: Prisma.github_repositoriesCreateManyInput;
	languages: Prisma.github_languagesCreateManyInput;
	branches: Prisma.github_repository_branchesCreateManyInput[];
}

/** Shared deleteMany filter shape for rows created by the seed source. */
export interface SeedFilter {
	where: {
		cq_source_name: string;
	};
}
