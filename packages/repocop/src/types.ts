import type { github_repositories } from '@prisma/client';

export interface RepoAndStack {
	fullName: string;
	stacks: string[];
}

type RequiredRepositoryFields = Pick<
	NonNullable<github_repositories>,
	'archived' | 'created_at' | 'full_name' | 'id' | 'name' | 'topics'
>;

type OptionalRepositoryFields = Pick<
	github_repositories,
	'updated_at' | 'pushed_at' | 'default_branch'
>;

export type Repository = RequiredRepositoryFields & OptionalRepositoryFields;
