import type {
	aws_securityhub_findings,
	PrismaClient,
	view_repo_ownership,
} from '@prisma/client';
import { toNonEmptyArray } from './functions.js';
import type {
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
