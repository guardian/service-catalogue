/**
 * Seeds the local development database with deterministic repository, workflow,
 * ownership, and auxiliary records used by the service catalogue stack.
 *
 * This entrypoint is intentionally limited to orchestration:
 * - prepare database prerequisites
 * - clear previously seeded records
 * - insert the assembled seed payload
 * - refresh dependent materialized views
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { type Prisma, PrismaClient } from '../prisma-client/client.js';
import { buildGitHubSeedData } from './seed/seed-assembly.js';
import {
	type BreakglassSeedData,
	buildBreakglassSeedData,
} from './seed/seed-breakglass.js';
import { createTeam } from './seed/seed-builders.js';
import { cqSourceName, orgName } from './seed/seed-constants.js';
import { repoDefinitions, teamDefinitions } from './seed/seed-data.js';
import { createManyIfAny } from './seed/seed-helpers.js';
import type { GitHubSeedData, SeedFilter } from './seed/seed-types.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}
const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: databaseUrl }),
});
const seedFilter: SeedFilter = {
	where: { cq_source_name: cqSourceName },
};

const seededRepoFullNames = repoDefinitions.map(
	({ name }) => `${orgName}/${name}`,
);

/**
 * Ensures the placeholder aws_resources_raw function exists so local materialized
 * view refreshes can succeed even when AWS source tables are not present.
 */
async function ensureAwsResourcesRawFunction(): Promise<void> {
	await prisma.$executeRaw`
        CREATE OR REPLACE FUNCTION public.aws_resources_raw()
            RETURNS TABLE (
                cq_table      text,
                partition     text,
                service       text,
                region        text,
                account_id    text,
                resource_type text,
                arn           text,
                taggable      boolean,
                tags          jsonb
            )
            LANGUAGE sql
        AS $$
            SELECT
                NULL::text, NULL::text, NULL::text, NULL::text,
                NULL::text, NULL::text, NULL::text, NULL::boolean,
                NULL::jsonb
            WHERE false;
        $$;
    `;
}

/**
 * Removes previously seeded records for the current seed source and clears
 * runtime tables that must be reproducible across local runs.
 */
async function clearExistingSeedData(
	tx: Prisma.TransactionClient,
	seedFilter: SeedFilter,
	seededRepoFullNames: string[],
): Promise<void> {
	await tx.github_repository_branches.deleteMany(seedFilter);
	await tx.github_repository_custom_properties.deleteMany(seedFilter);
	await tx.github_team_repositories.deleteMany(seedFilter);
	await tx.github_languages.deleteMany(seedFilter);
	await tx.github_workflows.deleteMany(seedFilter);
	await tx.aws_cloudformation_stacks.deleteMany(seedFilter);
	await tx.github_repositories.deleteMany(seedFilter);
	await tx.github_teams.deleteMany(seedFilter);

	await tx.aws_iam_credential_reports.deleteMany(seedFilter);
	await tx.aws_iam_users.deleteMany(seedFilter);
	await tx.aws_organizations_accounts.deleteMany(seedFilter);

	// runtime/output tables: always clear for reproducible local runs
	await tx.guardian_github_actions_usage.deleteMany({
		where: {
			full_name: { in: seededRepoFullNames },
		},
	});
	await tx.cloudquery_plugin_usage.deleteMany({});
	await tx.cloudbuster_fsbp_vulnerabilities.deleteMany({});
	await tx.repocop_github_repository_rules.deleteMany({});
	await tx.repocop_vulnerabilities.deleteMany({});
	await tx.obligatron_results.deleteMany({});
}

/**
 * Inserts the assembled seed payload inside the active Prisma transaction.
 */
async function insertSeedData(
	tx: Prisma.TransactionClient,
	teams: Prisma.github_teamsCreateManyInput[],
	gitHubSeedData: GitHubSeedData,
	breakglassReportSeedData: BreakglassSeedData,
): Promise<void> {
	await tx.github_teams.createMany({ data: teams });
	await tx.github_repositories.createMany({ data: gitHubSeedData.repos });

	await createManyIfAny(gitHubSeedData.githubWorkflows, (data) =>
		tx.github_workflows.createMany({ data }),
	);

	await createManyIfAny(gitHubSeedData.githubActionsUsages, (data) =>
		tx.guardian_github_actions_usage.createMany({ data }),
	);

	await tx.github_languages.createMany({ data: gitHubSeedData.languages });
	await tx.github_team_repositories.createMany({
		data: gitHubSeedData.teamRepos,
	});
	await tx.github_repository_branches.createMany({
		data: gitHubSeedData.branches,
	});

	await createManyIfAny(gitHubSeedData.cloudFormationStacks, (data) =>
		tx.aws_cloudformation_stacks.createMany({ data }),
	);

	await createManyIfAny(gitHubSeedData.customProperties, (data) =>
		tx.github_repository_custom_properties.createMany({ data }),
	);

	await tx.aws_organizations_accounts.createMany({
		data: breakglassReportSeedData.organizationsAccounts,
	});
	await tx.aws_iam_users.createMany({
		data: breakglassReportSeedData.iamUsers,
	});
	await tx.aws_iam_credential_reports.createMany({
		data: breakglassReportSeedData.iamCredentialReports,
	});
}

/**
 * Refreshes the aws_resources materialized view after seeding.
 *
 * Falls back to WITH NO DATA when local seed databases do not contain the
 * underlying AWS source tables.
 */
async function refreshAwsResourcesView(): Promise<void> {
	try {
		await prisma.$executeRaw`REFRESH MATERIALIZED VIEW aws_resources;`;
		console.log('Materialized view refreshed.');
	} catch (error) {
		console.warn(
			'Skipping materialized view refresh - no AWS tables present in local seed DB.',
			error instanceof Error ? error.message : error,
		);
		await prisma.$executeRaw`REFRESH MATERIALIZED VIEW aws_resources WITH NO DATA;`;
	}
}

/**
 * Runs the end-to-end local seed flow.
 */
async function main(): Promise<void> {
	await ensureAwsResourcesRawFunction();

	const teams = teamDefinitions.map(({ id, slug }) => createTeam(id, slug));

	const gitHubSeedData = buildGitHubSeedData();
	const breakglassReportSeedData = buildBreakglassSeedData();

	console.log(
		'Seeding teams, repos, workflows, languages, and related records...',
	);

	await prisma.$transaction(async (tx) => {
		await clearExistingSeedData(tx, seedFilter, seededRepoFullNames);
		await insertSeedData(tx, teams, gitHubSeedData, breakglassReportSeedData);
	});

	console.log('Seeding complete!');

	console.log('Refreshing materialized view aws_resources...');
	await refreshAwsResourcesView();
}

main()
	.catch((error: unknown) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
