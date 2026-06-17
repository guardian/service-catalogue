import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../prisma-client/client.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}

try {
	new URL(databaseUrl);
} catch {
	throw new Error(`DATABASE_URL is invalid: "${databaseUrl}"`);
}

const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const orgName = 'guardian';
const cqSourceName = 'seed';
const seededAt = new Date('2026-06-01T12:00:00.000Z');

type RoleName = 'triage' | 'read' | 'maintain' | 'write' | 'admin';
type TeamSlug = 'frontend' | 'backend' | 'devops' | 'cricket';

interface RepoDefinition {
	id: number;
	name: string;
	languages: readonly string[];
	owners: ReadonlyArray<{ teamSlug: TeamSlug; roleName: RoleName }>;
	githubActionsUses: readonly string[];
	cloudFormation?: boolean;
	customProperties?: boolean;
	workflowPath?: string;
}

interface RepoBundle {
	repo: Prisma.github_repositoriesCreateManyInput;
	languages: Prisma.github_languagesCreateManyInput;
	branches: Prisma.github_repository_branchesCreateManyInput[];
}

const teamDefinitions = [
	{ id: 1, slug: 'frontend' },
	{ id: 2, slug: 'backend' },
	{ id: 3, slug: 'devops' },
	{ id: 4, slug: 'cricket' },
] as const satisfies ReadonlyArray<{ id: number; slug: TeamSlug }>;

const repoDefinitions = [
	{
		id: 1,
		name: 'dotcom-rendering',
		languages: ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'Shell'],
		owners: [{ teamSlug: 'frontend', roleName: 'admin' }],
		githubActionsUses: ['actions/checkout@v2', 'actions/setup-node@v2'],
		cloudFormation: true,
	},
	{
		id: 2,
		name: 'janus-app',
		languages: ['Scala', 'Dockerfile', 'Shell'],
		owners: [
			{ teamSlug: 'backend', roleName: 'admin' },
			{ teamSlug: 'devops', roleName: 'admin' },
		],
		githubActionsUses: ['actions/checkout@v2', 'actions/setup-scala@v1'],
		cloudFormation: true,
		customProperties: true,
	},
	{
		id: 3,
		name: 'fsbp-fix',
		languages: ['Go', 'Shell'],
		owners: [{ teamSlug: 'devops', roleName: 'admin' }],
		githubActionsUses: ['actions/checkout@v2', 'actions/setup-python@v2'],
	},
	{
		id: 4,
		name: 'cricket',
		languages: ['Python', 'Terraform', 'Shell'],
		owners: [{ teamSlug: 'cricket', roleName: 'admin' }],
		githubActionsUses: ['actions/checkout@v2', 'actions/setup-go@v2'],
		cloudFormation: true,
	},
] as const satisfies readonly RepoDefinition[];

const createSeedMetadata = (cq_source_name: string = cqSourceName) => ({
	cq_sync_time: null,
	cq_source_name,
	cq_id: randomUUID(),
	cq_parent_id: null,
});

function createTeam(
	id: number,
	slug: TeamSlug,
	org: string = orgName,
	cq_source_name: string = cqSourceName,
): Prisma.github_teamsCreateManyInput {
	return {
		...createSeedMetadata(cq_source_name),
		id: BigInt(id),
		name: slug.charAt(0).toUpperCase() + slug.slice(1),
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

function createBranch(
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
		protected: branchName === 'main',
	};
}

function createRepoAndChildren(
	id: number,
	name: string,
	languageList: readonly string[],
	org: string = orgName,
	cq_source_name: string = cqSourceName,
): RepoBundle {
	const fullName = `${org}/${name}`;
	const repo: Prisma.github_repositoriesCreateManyInput = {
		...createSeedMetadata(cq_source_name),
		org,
		id: BigInt(id),
		node_id: null,
		owner: Prisma.DbNull,
		name,
		full_name: fullName,
		description: `The ${name} repository`,
		created_at: new Date('2020-01-01T00:00:00Z'),
		default_branch: 'main',
		pushed_at: new Date('2021-01-01T00:00:00Z'),
		updated_at: new Date('2021-01-01T00:00:00Z'),
		language: languageList[0] ?? null,
		topics: ['production'],
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
		archived: null,
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
		repo,
		languages: {
			...createSeedMetadata(cq_source_name),
			full_name: fullName,
			name,
			languages: [...languageList],
		},
		branches: ['main', 'develop', 'feature-1'].map((branchName) =>
			createBranch(repo.id, repo.org, branchName, cq_source_name),
		),
	};
}

function createRepoOwnership(
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

function createCloudFormationStack(
	name: string,
	cq_source_name: string = cqSourceName,
): Prisma.aws_cloudformation_stacksCreateManyInput {
	const accountId = '000000000000';
	const region = 'eu-west-1';
	const uuid = randomUUID();
	const arn = `arn:aws:cloudformation:${region}:${accountId}:stack/${name}/${uuid}`;

	return {
		...createSeedMetadata(cq_source_name),
		id: arn,
		tags: [
			{ Key: 'Stack', Value: `${name}-stack` },
			{ Key: 'Stage', Value: 'PROD' },
			{ Key: 'App', Value: `${name}-app` },
			{ Key: 'gu:repo', Value: `${orgName}/${name}` },
		] as Prisma.InputJsonValue,
		account_id: accountId,
		region,
		stack_status: 'CREATE_COMPLETE',
		creation_time: new Date('2020-01-01T00:00:00Z'),
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

function createCustomProperties(
	repoId: bigint,
): Prisma.github_repository_custom_propertiesCreateManyInput {
	return {
		...createSeedMetadata(),
		org: orgName,
		property_name: 'gu_dependency_graph_integrator_ignore',
		repository_id: repoId,
		value: ['true'],
	};
}

function createGithubActionsUsage(
	name: string,
	workflowUses: readonly string[],
	workflowPath: string = 'ci.yaml',
): Prisma.guardian_github_actions_usageCreateManyInput {
	return {
		evaluated_on: seededAt,
		full_name: `${orgName}/${name}`,
		workflow_path: `.github/workflows/${workflowPath}`,
		workflow_uses: [...workflowUses],
	};
}

async function main() {
	const teams = teamDefinitions.map(({ id, slug }) => createTeam(id, slug));
	const teamsBySlug = new Map(
		teamDefinitions.map(({ slug }, index) => [slug, teams[index]] as const),
	);

	const repoBundles = repoDefinitions.map(({ id, name, languages }) =>
		createRepoAndChildren(id, name, languages),
	);
	const repoByName = new Map(
		repoDefinitions.map(
			({ name }, index) => [name, repoBundles[index]] as const,
		),
	);

	const repos = repoBundles.map(({ repo }) => repo);
	const languages = repoBundles.map(
		({ languages: repoLanguages }) => repoLanguages,
	);
	const branches = repoBundles.flatMap(
		({ branches: repoBranches }) => repoBranches,
	);

	const teamRepos = repoDefinitions.flatMap(({ name, owners }) => {
		const repoBundle = repoByName.get(name);
		if (!repoBundle) {
			throw new Error(`Missing seeded repo: ${name}`);
		}

		return owners.map(({ teamSlug, roleName }) => {
			const team = teamsBySlug.get(teamSlug);
			if (!team) {
				throw new Error(`Missing seeded team: ${teamSlug}`);
			}

			return createRepoOwnership(repoBundle.repo, team.id, roleName);
		});
	});

	const cloudFormationStacks = repoDefinitions
		.filter(({ cloudFormation }) => cloudFormation)
		.map(({ name }) => createCloudFormationStack(name));

	const githubActionsUsages = repoDefinitions.map(
		({ name, githubActionsUses, workflowPath }) =>
			createGithubActionsUsage(name, githubActionsUses, workflowPath),
	);

	const customProperties = repoDefinitions
		.filter(({ customProperties }) => customProperties)
		.map(({ name }) => {
			const repoBundle = repoByName.get(name);
			if (!repoBundle) {
				throw new Error(`Missing seeded repo for custom properties: ${name}`);
			}

			return createCustomProperties(repoBundle.repo.id);
		});

	const seededRepoFullNames = repos
		.map(({ full_name }) => full_name)
		.filter((value): value is string => value !== null);

	const seedFilter = { where: { cq_source_name: cqSourceName } };

	console.log(
		'Seeding teams, repos, languages, and team-repo relationships...',
	);

	await prisma.$transaction(async (tx) => {
		await tx.github_repository_branches.deleteMany(seedFilter);
		await tx.github_repository_custom_properties.deleteMany(seedFilter);
		await tx.github_team_repositories.deleteMany(seedFilter);
		await tx.github_workflows.deleteMany(seedFilter);
		await tx.github_languages.deleteMany(seedFilter);
		await tx.guardian_github_actions_usage.deleteMany({
			where: {
				evaluated_on: seededAt,
				full_name: { in: seededRepoFullNames },
			},
		});
		await tx.aws_cloudformation_stacks.deleteMany(seedFilter);
		await tx.github_repositories.deleteMany(seedFilter);
		await tx.github_teams.deleteMany(seedFilter);

		await tx.github_teams.createMany({ data: teams });
		await tx.github_repositories.createMany({ data: repos });
		await tx.github_languages.createMany({ data: languages });
		await tx.github_team_repositories.createMany({ data: teamRepos });
		await tx.github_repository_branches.createMany({ data: branches });
		await tx.aws_cloudformation_stacks.createMany({
			data: cloudFormationStacks,
		});

		if (customProperties.length > 0) {
			await tx.github_repository_custom_properties.createMany({
				data: customProperties,
			});
		}

		await tx.guardian_github_actions_usage.createMany({
			data: githubActionsUsages,
		});
	});

	console.log('Seeding complete!');
}

main()
	.catch((error: unknown) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
