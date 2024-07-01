import type {
	github_repositories,
	PrismaClient,
	repocop_vulnerabilities,
} from '@prisma/client';
import { stringToSeverity, toNonEmptyArray } from 'common/src/functions';
import type { NonEmptyArray, RepocopVulnerability } from 'common/src/types';
import type { ObligationResult } from '.';

// type UserEvent = Event & {UserId: string}

function prismaToCustomType(
	vuln: repocop_vulnerabilities,
): RepocopVulnerability {
	return {
		...vuln,
		severity: stringToSeverity(vuln.severity),
	};
}

async function getRepocopVulnerabilities(
	client: PrismaClient,
): Promise<NonEmptyArray<RepocopVulnerability>> {
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
	const vulns = await getRepocopVulnerabilities(client);

	// For every repo in repos, log if it shows up in vulns
	const resultsOrUndefined: Array<ObligationResult | undefined> = repos
		.slice(0, 40)
		.map((repo) => {
			const repoVulns = vulns.filter((v) => v.full_name === repo.full_name);

			if (repoVulns.length > 0) {
				const vulnNames = repoVulns.map((v) => v.package);
				console.log({
					message: `Repository ${repo.full_name} has ${repoVulns.length} vulnerabilities`,
					vulnNames,
				});

				return {
					resource: repo.full_name ?? 'unknown', //This will never happen in reality
					reason: `Repository has ${repoVulns.length} vulnerabilities, ${vulnNames.join(', ')}`,
					url: 'https://metrics.gutools.co.uk/d/fdib3p8l85jwgd',
				};
			} else {
				return undefined;
			}
		});

	return resultsOrUndefined.filter(
		(r): r is ObligationResult => r !== undefined,
	);
}

// export type ObligationResult = {
// 	resource: string;
// 	reason: string;
// 	url?: string;
// 	contacts?: {
// 		aws_account_id?: string;
// 		Stack?: string;
// 		Stage?: string;
// 		App?: string;
// 	};
// };
