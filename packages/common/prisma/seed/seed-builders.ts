/**
 * Low-level builders for seeded database rows and directly derived child records.
 *
 * These helpers are responsible for constructing individual records or tightly
 * related record bundles from inputs, without deciding which fixtures should be
 * assembled for a given seed scenario.
 */
import { randomUUID } from 'node:crypto';
import { Prisma } from '../../prisma-client/client.js';
import {
	cqSourceName,
	defaultWorkflowPath,
	orgName,
	workflowDirectory,
} from './seed-constants.js';
import { createSeedMetadata } from './seed-helpers.js';
import type {
	RepoBundle,
	RepoDefinition,
	RoleName,
	SeedData,
	TeamSlug,
} from './seed-types.js';

const defaultBranchName = 'main';
const repositoryCreatedAt = new Date('2020-01-01T00:00:00Z');
const repositoryUpdatedAt = new Date('2021-01-01T00:00:00Z');
const branchNames = [defaultBranchName, 'develop', 'feature-1'] as const;
const cloudFormationAccountId = '000000000000';
const cloudFormationRegion = 'eu-west-1';
const defaultRepoTopics = ['production'] as const;

export function capitalise(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Builds a seeded GitHub team row.
 */
export function createTeam(
	id: number,
	slug: TeamSlug,
	org: string = orgName,
	cq_source_name: string = cqSourceName,
): Prisma.github_teamsCreateManyInput {
	return {
		...createSeedMetadata(cq_source_name),
		id: BigInt(id),
		name: capitalise(slug),
		slug,
		description: `The ${slug} team`,
		org,
		url: `https://github.com/orgs/${org}/teams/${slug}`,
		node_id: null,
		permission: null,
		permissions: Prisma.DbNull,
		privacy: null,
		members_count: null,
		repos_count: null,
		organization: Prisma.DbNull,
		html_url: null,
		members_url: null,
		repositories_url: null,
		parent: Prisma.DbNull,
		ldap_dn: null,
		notification_setting: null,
		assignment: null,
	};
}

/**
 * Builds a seeded GitHub branch row for a repository.
 */
export function createBranch(
	repositoryId: bigint,
	org: string,
	branchName: string,
	cq_source_name: string = cqSourceName,
): Prisma.github_repository_branchesCreateManyInput {
	return {
		...createSeedMetadata(cq_source_name),
		org,
		repository_id: repositoryId,
		protection: Prisma.DbNull,
		name: branchName,
		commit: Prisma.DbNull,
		protected: branchName === defaultBranchName,
	};
}

/**
 * Builds a seeded repository row together with its derived language and branch rows.
 */
export function createRepoAndChildren(
	id: number,
	name: string,
	languageList: readonly string[],
	org: string = orgName,
	cq_source_name: string = cqSourceName,
): RepoBundle {
	const repositoryId = BigInt(id);
	const fullName = `${org}/${name}`;

	const repo: Prisma.github_repositoriesCreateManyInput = {
		...createSeedMetadata(cq_source_name),
		org,
		id: repositoryId,
		node_id: null,
		owner: Prisma.DbNull,
		name,
		full_name: fullName,
		description: `The ${name} repository`,
		created_at: repositoryCreatedAt,
		default_branch: defaultBranchName,
		pushed_at: repositoryUpdatedAt,
		updated_at: repositoryUpdatedAt,
		language: languageList[0] ?? null,
		topics: [...defaultRepoTopics],
		homepage: null,
		code_of_conduct: Prisma.DbNull,
		master_branch: null,
		html_url: null,
		clone_url: null,
		git_url: null,
		mirror_url: null,
		ssh_url: null,
		svn_url: null,
		fork: null,
		forks_count: null,
		network_count: null,
		open_issues_count: null,
		open_issues: null,
		stargazers_count: null,
		subscribers_count: null,
		watchers_count: null,
		watchers: null,
		size: null,
		auto_init: null,
		parent: Prisma.DbNull,
		source: Prisma.DbNull,
		template_repository: Prisma.DbNull,
		organization: Prisma.DbNull,
		permissions: Prisma.DbNull,
		allow_rebase_merge: null,
		allow_update_branch: null,
		allow_squash_merge: null,
		allow_merge_commit: null,
		allow_auto_merge: null,
		allow_forking: null,
		delete_branch_on_merge: null,
		use_squash_pr_title_as_default: null,
		squash_merge_commit_title: null,
		squash_merge_commit_message: null,
		merge_commit_title: null,
		merge_commit_message: null,
		archived: false,
		disabled: null,
		license: Prisma.DbNull,
		private: null,
		has_issues: null,
		has_wiki: null,
		has_pages: null,
		has_projects: null,
		has_downloads: null,
		has_discussions: null,
		is_template: null,
		license_template: null,
		gitignore_template: null,
		security_and_analysis: Prisma.DbNull,
		team_id: null,
		url: null,
		archive_url: null,
		assignees_url: null,
		blobs_url: null,
		branches_url: null,
		collaborators_url: null,
		comments_url: null,
		commits_url: null,
		compare_url: null,
		contents_url: null,
		contributors_url: null,
		deployments_url: null,
		downloads_url: null,
		events_url: null,
		forks_url: null,
		git_commits_url: null,
		git_refs_url: null,
		git_tags_url: null,
		hooks_url: null,
		issue_comment_url: null,
		issue_events_url: null,
		issues_url: null,
		keys_url: null,
		labels_url: null,
		languages_url: null,
		merges_url: null,
		milestones_url: null,
		notifications_url: null,
		pulls_url: null,
		releases_url: null,
		stargazers_url: null,
		statuses_url: null,
		subscribers_url: null,
		subscription_url: null,
		tags_url: null,
		trees_url: null,
		teams_url: null,
		text_matches: Prisma.DbNull,
		visibility: null,
		role_name: null,
		custom_properties: Prisma.DbNull,
		web_commit_signoff_required: null,
	};

	return {
		repositoryId,
		repo,
		languages: {
			...createSeedMetadata(cq_source_name),
			full_name: fullName,
			name,
			languages: [...languageList],
		},
		branches: branchNames.map((branchName) =>
			createBranch(repositoryId, org, branchName, cq_source_name),
		),
	};
}

/**
 * Builds a seeded team-to-repository ownership row from a repository record.
 */
export function createRepoOwnership(
	repo: Prisma.github_repositoriesCreateManyInput,
	teamId: bigint,
	roleName: RoleName,
	cq_source_name: string = cqSourceName,
): Prisma.github_team_repositoriesCreateManyInput {
	return {
		...repo,
		...createSeedMetadata(cq_source_name),
		team_id: teamId,
		role_name: roleName,
		topics: repo.topics ?? [],
	};
}

/**
 * Builds a seeded CloudFormation stack row associated with a repository.
 */
export function createCloudFormationStack(
	name: string,
	cq_source_name: string = cqSourceName,
): Prisma.aws_cloudformation_stacksCreateManyInput {
	const uuid = randomUUID();
	const arn = `arn:aws:cloudformation:${cloudFormationRegion}:${cloudFormationAccountId}:stack/${name}/${uuid}`;

	return {
		...createSeedMetadata(cq_source_name),
		id: arn,
		tags: [
			{ Key: 'Stack', Value: `${name}-stack` },
			{ Key: 'Stage', Value: 'PROD' },
			{ Key: 'App', Value: `${name}-app` },
			{ Key: 'gu:repo', Value: `${orgName}/${name}` },
		] as Prisma.InputJsonValue,
		account_id: cloudFormationAccountId,
		region: cloudFormationRegion,
		stack_status: 'CREATE_COMPLETE',
		creation_time: repositoryCreatedAt,
		arn,
		stack_name: name,
		capabilities: [],
		change_set_id: null,
		deletion_time: null,
		description: `The ${name} stack`,
		disable_rollback: false,
		drift_information: Prisma.DbNull,
		enable_termination_protection: false,
		last_updated_time: null,
		notification_arns: [],
		outputs: Prisma.DbNull,
		parameters: Prisma.DbNull,
		parent_id: null,
		retain_except_on_create: null,
		role_arn: null,
		rollback_configuration: Prisma.DbNull,
		root_id: null,
		stack_id: arn,
		stack_status_reason: null,
		timeout_in_minutes: null,
		deletion_mode: null,
		detailed_status: null,
	};
}

/**
 * Builds a seeded custom property row for a repository.
 */
export function createCustomProperties(
	repoId: bigint,
	cq_source_name: string = cqSourceName,
): Prisma.github_repository_custom_propertiesCreateManyInput {
	return {
		...createSeedMetadata(cq_source_name),
		org: orgName,
		property_name: 'gu_dependency_graph_integrator_ignore',
		repository_id: repoId,
		value: ['true'],
	};
}

/**
 * Renders deterministic workflow YAML contents for a list of referenced actions.
 */
export function createWorkflowContents(
	workflowUses: readonly string[],
): string {
	const usesSteps = workflowUses.map(
		(workflowUse) => `      - uses: ${workflowUse}`,
	);

	return `name: CI
on:
  push:
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
${usesSteps.join('\n')}
      - run: echo "seeded workflow"
`;
}

/**
 * Builds a seeded GitHub workflow row.
 */
export function createGithubWorkflow(
	id: bigint,
	repositoryId: bigint,
	workflowUses: readonly string[],
	workflowPath: string = defaultWorkflowPath,
	org: string = orgName,
	cq_source_name: string = cqSourceName,
): Prisma.github_workflowsCreateManyInput {
	return {
		...createSeedMetadata(cq_source_name),
		org,
		id,
		repository_id: repositoryId,
		path: `${workflowDirectory}/${workflowPath}`,
		contents: createWorkflowContents(workflowUses),
	};
}

/**
 * Builds a seeded guardian_github_actions_usage row.
 */
export function createGithubActionsUsage(
	fullName: string,
	workflowUses: readonly string[],
	workflowPath: string = defaultWorkflowPath,
): Prisma.guardian_github_actions_usageCreateManyInput {
	return {
		full_name: fullName,
		workflow_path: `${workflowDirectory}/${workflowPath}`,
		evaluated_on: new Date('2024-01-01T12:00:00.000Z'), // Keep a fixed timestamp so local seed data is deterministic across runs
		workflow_uses: [...workflowUses],
	};
}

/**
 * Adds optional seeded records declared by a repository fixture definition.
 */
export function addOptionalSeedData(
	acc: SeedData,
	definition: RepoDefinition,
): void {
	if (definition.cloudFormation === true) {
		acc.cloudFormationStacks.push(createCloudFormationStack(definition.name));
	}

	if (definition.customProperties === true) {
		acc.customProperties.push(createCustomProperties(BigInt(definition.id)));
	}
}

/**
 * Creates an empty mutable seed payload accumulator.
 */
export function createEmptySeedData(): SeedData {
	return {
		repos: [],
		languages: [],
		branches: [],
		teamRepos: [],
		cloudFormationStacks: [],
		githubWorkflows: [],
		githubActionsUsages: [],
		customProperties: [],
	};
}
