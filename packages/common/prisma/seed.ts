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

const defaultBranchName = 'main';
const branchNames = [defaultBranchName, 'develop', 'feature-1'] as const;
const repositoryCreatedAt = new Date('2020-01-01T00:00:00Z');
const repositoryUpdatedAt = new Date('2021-01-01T00:00:00Z');
const workflowDirectory = '.github/workflows';
const defaultWorkflowPath = 'ci.yaml';
const cloudFormationAccountId = '000000000000';
const cloudFormationRegion = 'eu-west-1';
const defaultRepoTopics = ['production'] as const;

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
	repositoryId: bigint;
	repo: Prisma.github_repositoriesCreateManyInput;
	languages: Prisma.github_languagesCreateManyInput;
	branches: Prisma.github_repository_branchesCreateManyInput[];
}

interface SeedData {
	repos: Prisma.github_repositoriesCreateManyInput[];
	languages: Prisma.github_languagesCreateManyInput[];
	branches: Prisma.github_repository_branchesCreateManyInput[];
	teamRepos: Prisma.github_team_repositoriesCreateManyInput[];
	cloudFormationStacks: Prisma.aws_cloudformation_stacksCreateManyInput[];
	githubActionsUsages: Prisma.guardian_github_actions_usageCreateManyInput[];
	customProperties: Prisma.github_repository_custom_propertiesCreateManyInput[];
	securityHubFindings: Prisma.aws_securityhub_findingsCreateManyInput[];
}

const teamDefinitions = [
	{ id: 1, slug: 'frontend' },
	{ id: 2, slug: 'backend' },
	{ id: 3, slug: 'devops' },
	{ id: 4, slug: 'cricket' },
] as const satisfies ReadonlyArray<{ id: number; slug: TeamSlug }>;

const owner = (
	teamSlug: TeamSlug,
	roleName: RoleName = 'admin',
): { teamSlug: TeamSlug; roleName: RoleName } => ({ teamSlug, roleName });

const githubActionUses = {
	node: ['actions/checkout@v2', 'actions/setup-node@v2'],
	scala: ['actions/checkout@v2', 'actions/setup-scala@v1'],
	python: ['actions/checkout@v2', 'actions/setup-python@v2'],
	go: ['actions/checkout@v2', 'actions/setup-go@v2'],
} as const;

const repoDefinitions: readonly RepoDefinition[] = [
	{
		id: 1,
		name: 'dotcom-rendering',
		languages: ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'Shell'],
		owners: [owner('frontend')],
		githubActionsUses: githubActionUses.node,
		cloudFormation: true,
	},
	{
		id: 2,
		name: 'janus-app',
		languages: ['Scala', 'Dockerfile', 'Shell'],
		owners: [owner('backend'), owner('devops')],
		githubActionsUses: githubActionUses.scala,
		cloudFormation: true,
		customProperties: true,
	},
	{
		id: 3,
		name: 'fsbp-fix',
		languages: ['Go', 'Shell'],
		owners: [owner('devops')],
		githubActionsUses: githubActionUses.python,
	},
	{
		id: 4,
		name: 'cricket',
		languages: ['Python', 'Terraform', 'Shell'],
		owners: [owner('cricket')],
		githubActionsUses: githubActionUses.go,
		cloudFormation: true,
	},
];

const createSeedMetadata = (cq_source_name: string = cqSourceName) => ({
	cq_sync_time: null,
	cq_source_name,
	cq_id: randomUUID(),
	cq_parent_id: null,
});

function capitalise(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

function createTeam(
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
		protected: branchName === defaultBranchName,
	};
}

function createRepoAndChildren(
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

function createCustomProperties(
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

function createGithubActionsUsage(
	name: string,
	workflowUses: readonly string[],
	workflowPath: string = defaultWorkflowPath,
): Prisma.guardian_github_actions_usageCreateManyInput {
	return {
		evaluated_on: seededAt,
		full_name: `${orgName}/${name}`,
		workflow_path: `${workflowDirectory}/${workflowPath}`,
		workflow_uses: [...workflowUses],
	};
}

function createSecurityHubFinding(
	accountId: string,
	accountName: string,
	controlId: string,
	title: string,
	severityLabel: 'CRITICAL' | 'HIGH',
	severityNormalized: number,
	resourceArn: string,
	resourceRegion: string,
	resourceType: string,
	resourceTags: Record<string, string>,
	cq_source_name: string = cqSourceName,
): Prisma.aws_securityhub_findingsCreateManyInput {
	return {
		...createSeedMetadata(cq_source_name),
		request_account_id: accountId,
		request_region: resourceRegion,
		aws_account_id: accountId,
		aws_account_name: accountName,
		title,
		generator_id: `aws-foundational-security-best-practices/v/1.0.0/${controlId}`,
		product_fields: { ControlId: controlId },
		severity: { Label: severityLabel, Normalized: severityNormalized },
		resources: [
			{
				Id: resourceArn,
				Region: resourceRegion,
				Type: resourceType,
				Tags: resourceTags,
			},
		],
		remediation: {
			Recommendation: {
				Url: `https://docs.aws.amazon.com/console/securityhub/${controlId}/remediation`,
			},
		},
		workflow: { Status: 'NEW' },
		record_state: 'ACTIVE',
		compliance: { Status: 'FAILED' },
		first_observed_at: seededAt,
		created_at: seededAt,
		updated_at: seededAt,
		region: resourceRegion,
		types: ['Software and Configuration Checks/AWS Security Best Practices'],
	};
}

function addOptionalSeedData(acc: SeedData, definition: RepoDefinition): void {
	if (definition.cloudFormation === true) {
		acc.cloudFormationStacks.push(createCloudFormationStack(definition.name));

		acc.securityHubFindings.push(
			createSecurityHubFinding(
				cloudFormationAccountId,
				'guardian-deploy-tools',
				'S3.5',
				`Sample finding for ${definition.name}`,
				'HIGH',
				70,
				`arn:aws:s3:::${definition.name}-bucket`,
				cloudFormationRegion,
				'AwsS3Bucket',
				{
					Stack: `${definition.name}-stack`,
					Stage: 'PROD',
					App: `${definition.name}-app`,
					'gu:repo': `${orgName}/${definition.name}`,
				},
			),
		);
	}

	if (definition.customProperties === true) {
		acc.customProperties.push(createCustomProperties(BigInt(definition.id)));
	}
}

function createEmptySeedData(): SeedData {
	return {
		repos: [],
		languages: [],
		branches: [],
		teamRepos: [],
		cloudFormationStacks: [],
		githubActionsUsages: [],
		customProperties: [],
		securityHubFindings: [],
	};
}

async function createManyIfAny<T>(
	data: T[],
	create: (rows: T[]) => Promise<unknown>,
): Promise<void> {
	if (data.length > 0) {
		await create(data);
	}
}
// Local seed data needs this helper because the aws_resources materialized view
// depends on it, and refresh-materialized-view refreshes that view in DEV.
async function ensureTableHasColumnFunction(): Promise<void> {
	await prisma.$executeRawUnsafe(`
        CREATE OR REPLACE FUNCTION public.table_has_column(
            p_table_name information_schema.sql_identifier,
            p_column_name text
        )
        RETURNS boolean
        LANGUAGE sql
        STABLE
        AS $$
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.columns c
                WHERE c.table_schema = 'public'
                    AND c.table_name = p_table_name
                    AND c.column_name = p_column_name
            );
        $$;
    `);
}

async function main() {
	await ensureTableHasColumnFunction();
	const teams = teamDefinitions.map(({ id, slug }) => createTeam(id, slug));
	const teamIdsBySlug = new Map<TeamSlug, bigint>(
		teamDefinitions.map(({ id, slug }) => [slug, BigInt(id)] as const),
	);

	const seedData = repoDefinitions.reduce<SeedData>((acc, definition) => {
		const repoBundle = createRepoAndChildren(
			definition.id,
			definition.name,
			definition.languages,
		);

		acc.repos.push(repoBundle.repo);
		acc.languages.push(repoBundle.languages);
		acc.branches.push(...repoBundle.branches);

		acc.githubActionsUsages.push(
			createGithubActionsUsage(
				definition.name,
				definition.githubActionsUses,
				definition.workflowPath ?? defaultWorkflowPath,
			),
		);

		for (const { teamSlug, roleName } of definition.owners) {
			const teamId = teamIdsBySlug.get(teamSlug);
			if (!teamId) {
				throw new Error(`Missing seeded team: ${teamSlug}`);
			}

			acc.teamRepos.push(
				createRepoOwnership(repoBundle.repo, teamId, roleName),
			);
		}

		// handles cloudFormation + customProperties in one place
		addOptionalSeedData(acc, definition);

		return acc;
	}, createEmptySeedData());

	const seededRepoFullNames = repoDefinitions.map(
		({ name }) => `${orgName}/${name}`,
	);

	const seedFilter = { where: { cq_source_name: cqSourceName } };

	console.log(
		'Seeding teams, repos, languages, and team-repo relationships...',
	);

	await prisma.$transaction(async (tx) => {
		await tx.github_repository_branches.deleteMany(seedFilter);
		await tx.github_repository_custom_properties.deleteMany(seedFilter);
		await tx.github_team_repositories.deleteMany(seedFilter);
		await tx.github_languages.deleteMany(seedFilter);
		await tx.guardian_github_actions_usage.deleteMany({
			where: {
				evaluated_on: seededAt,
				full_name: { in: seededRepoFullNames },
			},
		});
		await tx.aws_securityhub_findings.deleteMany(seedFilter);
		await tx.aws_cloudformation_stacks.deleteMany(seedFilter);
		await tx.github_repositories.deleteMany(seedFilter);
		await tx.github_teams.deleteMany(seedFilter);

		// runtime/output tables: always clear for reproducible local runs
		await tx.cloudbuster_fsbp_vulnerabilities.deleteMany({});
		await tx.repocop_github_repository_rules.deleteMany({});
		await tx.repocop_vulnerabilities.deleteMany({});
		await tx.obligatron_results.deleteMany({});

		await tx.github_teams.createMany({ data: teams });
		await tx.github_repositories.createMany({ data: seedData.repos });
		await tx.github_languages.createMany({ data: seedData.languages });
		await tx.github_team_repositories.createMany({ data: seedData.teamRepos });
		await tx.github_repository_branches.createMany({ data: seedData.branches });

		await createManyIfAny(seedData.cloudFormationStacks, (data) =>
			tx.aws_cloudformation_stacks.createMany({ data }),
		);

		await createManyIfAny(seedData.customProperties, (data) =>
			tx.github_repository_custom_properties.createMany({ data }),
		);

		await createManyIfAny(seedData.githubActionsUsages, (data) =>
			tx.guardian_github_actions_usage.createMany({ data }),
		);

		await createManyIfAny(seedData.securityHubFindings, (data) =>
			tx.aws_securityhub_findings.createMany({ data }),
		);
	});

	console.log('Seeding complete!');
}

main()
	.catch((error: unknown) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
