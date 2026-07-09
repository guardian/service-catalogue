import type {
	aws_securityhub_findings,
	PrismaClient,
	view_repo_ownership,
} from 'common/prisma-client/client.js';
import { toNonEmptyArray } from './functions.js';
import type {
	AwsIamCredentialReport,
	AwsIamUser,
	AwsOrganizationsAccounts,
	NonEmptyArray,
	Repository,
	SecurityHubFinding,
	SecurityHubSeverity,
} from './types.js';
/**
 * Queries the database for FSBP findings
 */

export async function getFsbpFindings(
	prisma: PrismaClient,
	severities: SecurityHubSeverity[],
): Promise<SecurityHubFinding[]> {
	const findings: aws_securityhub_findings[] =
		await prisma.aws_securityhub_findings.findMany({
			where: {
				OR: severities.map((s) => ({
					severity: { path: ['Label'], equals: s },
				})),
				AND: {
					generator_id: {
						startsWith: 'aws-foundational-security-best-practices/v/1.0.0',
					},
				},
			},
		});

	return findings as unknown as SecurityHubFinding[];
}

export async function getRepoOwnership(
	client: PrismaClient,
): Promise<NonEmptyArray<view_repo_ownership>> {
	const data = await client.view_repo_ownership.findMany();
	console.log(`Found ${data.length} repo ownership records.`);
	return toNonEmptyArray(data);
}

export async function getRepositories(
	client: PrismaClient,
	ignoredRepositoryPrefixes: string[],
): Promise<NonEmptyArray<Repository>> {
	console.debug('Discovering repositories');
	const repositories = await client.github_repositories.findMany({
		where: {
			NOT: [
				{
					OR: ignoredRepositoryPrefixes.map((prefix) => {
						return { full_name: { startsWith: prefix } };
					}),
				},
			],
		},
	});

	console.debug(`Found ${repositories.length} repositories`);
	return toNonEmptyArray(repositories.map((r) => r as Repository));
}

export async function getExternalTeams(
	client: PrismaClient,
): Promise<string[]> {
	const teams = await client.guardian_non_p_and_e_github_teams.findMany();
	return toNonEmptyArray(teams.map((t) => t.team_name));
}

export async function getIamCredentialReports(
	client: PrismaClient,
): Promise<AwsIamCredentialReport[]> {
	const reports = await client.aws_iam_credential_reports.findMany();
	return toNonEmptyArray(reports.map((r) => r as AwsIamCredentialReport));
}

export async function getIamUsers(client: PrismaClient): Promise<AwsIamUser[]> {
	const users = await client.aws_iam_users.findMany();
	return toNonEmptyArray(users.map((u) => u as AwsIamUser));
}

export async function getAwsAccounts(
	client: PrismaClient,
): Promise<AwsOrganizationsAccounts[]> {
	const accounts = await client.aws_organizations_accounts.findMany();
	return toNonEmptyArray(accounts.map((a) => a as AwsOrganizationsAccounts));
}
