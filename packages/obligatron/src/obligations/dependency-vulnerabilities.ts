import type {
	github_repositories,
	PrismaClient,
	repocop_vulnerabilities,
} from '@prisma/client';
import { logger } from 'common/logs';
import {
	daysLeftToFix,
	stringToSeverity,
	toNonEmptyArray,
} from 'common/src/functions';
import {
	type NonEmptyArray,
	type RepocopVulnerability,
} from 'common/src/types';
import type { ObligationResult } from '.';

type ObligatronRepocopVulnerability = RepocopVulnerability & {
	repo_owner: string;
};

function prismaToCustomType(
	vuln: repocop_vulnerabilities,
): ObligatronRepocopVulnerability {
	return {
		...vuln,
		severity: stringToSeverity(vuln.severity),
	};
}

async function getRepocopVulnerabilities(
	client: PrismaClient,
): Promise<NonEmptyArray<ObligatronRepocopVulnerability>> {
	const rawResponse = await client.repocop_vulnerabilities.findMany({});

	return toNonEmptyArray(rawResponse.map(prismaToCustomType));
}

async function getProductionRepos(
	client: PrismaClient,
): Promise<github_repositories[]> {
	console.debug('Discovering repositories');
	const repositories = await client.github_repositories.findMany({
		where: {
			archived: false,
			topics: {
				has: 'production',
			},
		},
	});
	return toNonEmptyArray(repositories);
}

export async function evaluateDependencyVulnerabilityObligation(
	client: PrismaClient,
): Promise<ObligationResult[]> {
	const repos = await getProductionRepos(client);
	const vulns = (await getRepocopVulnerabilities(client)).filter(
		(v) => daysLeftToFix(v) === 0,
	);

	// For every repo in repos, log if it shows up in vulns
	const resultsOrUndefined: Array<ObligationResult | undefined> = repos
		.slice(0, 40)
		.map((repo) => {
			const repoVulns = vulns.filter((v) => v.full_name === repo.full_name);
			const vulnOwners = [...new Set(repoVulns.flatMap((v) => v.repo_owner))];

			if (repoVulns.length > 0) {
				const vulnNames = [...new Set(repoVulns.map((v) => v.package))];
				logger.log({
					message: `Repository ${repo.full_name} has ${repoVulns.length} vulnerable packages: ${vulnNames.join(', ')}`,
					vulnNames,
				});

				return {
					resource: repo.full_name ?? 'unknown', //This will never happen in reality
					reason: `Repository has ${vulnNames.length} vulnerable packages, ${vulnNames.join(', ')}`,
					url: 'https://metrics.gutools.co.uk/d/fdib3p8l85jwgd',
					contacts: { slugs: vulnOwners },
				};
			} else {
				return undefined;
			}
		});

	return resultsOrUndefined.filter(
		(r): r is ObligationResult => r !== undefined,
	);
}
