import type {
	github_languages,
	github_repository_branches,
	github_repository_custom_properties,
	guardian_github_actions_usage,
	PrismaClient,
} from '@prisma/client';
import type {
	NonEmptyArray,
	RepocopVulnerability,
	Repository,
} from 'common/src/types.js';
import type { Octokit } from 'octokit';
import { toNonEmptyArray } from '../../common/src/functions.js';
import { dependabotAlertToRepocopVulnerability } from './evaluation/repository.js';
import type {
	Alert,
	AwsCloudFormationStack,
	DependabotVulnResponse,
	Team,
	VulnerabilityAlertPRResponse,
} from './types.js';

// We only care about branches from repos we've selected, so lets only pull those to save us some time/memory
export async function getRepositoryBranches(
	client: PrismaClient,
	repos: Repository[],
): Promise<NonEmptyArray<github_repository_branches>> {
	const branches = await client.github_repository_branches.findMany({
		where: {
			repository_id: { in: repos.map((repo) => repo.id) },
		},
	});

	return toNonEmptyArray(branches);
}

export const getTeams = async (client: PrismaClient): Promise<Team[]> => {
	const teams = (
		await client.github_teams.findMany({
			select: {
				slug: true,
				id: true,
				name: true,
			},
		})
	).map((t) => t as Team);
	console.debug(`Found ${teams.length} teams.`);
	return toNonEmptyArray(teams);
};

export async function getStacks(
	client: PrismaClient,
): Promise<NonEmptyArray<AwsCloudFormationStack>> {
	const stacks = (
		await client.aws_cloudformation_stacks.findMany({
			select: {
				stack_name: true,
				tags: true,
				creation_time: true,
			},
		})
	).map((stack) => stack as AwsCloudFormationStack);

	console.debug(`Found ${stacks.length} stacks.`);
	return toNonEmptyArray(stacks);
}

export async function getRepositoryLanguages(
	client: PrismaClient,
): Promise<NonEmptyArray<github_languages>> {
	return toNonEmptyArray(await client.github_languages.findMany({}));
}

//Octokit Queries

export async function getPRFromAlertTimeline(
	octokit: Octokit,
	orgName: string,
	repoName: string,
	alertNumber: number,
): Promise<string | null> {
	const query = `
    query($owner: String!, $repo: String!, $alertNumber: Int!) {
      repository(owner: $owner, name: $repo) {
        vulnerabilityAlert(number: $alertNumber) {
          dependabotUpdate {
            pullRequest {
              url
            }
          }
        }
      }
    }
  `;

	const result = await octokit.graphql(query, {
		owner: orgName,
		repo: repoName,
		alertNumber,
	});

	const url = (result as VulnerabilityAlertPRResponse).repository
		.vulnerabilityAlert.dependabotUpdate?.pullRequest?.url;

	if (url) {
		console.log(
			`Dependabot update PR for repo ${repoName}, alert ${alertNumber}: ${url}`,
		);
	}
	return url ?? null;
}
async function getAlertsForRepo(
	octokit: Octokit,
	orgName: string,
	repoName: string,
): Promise<Alert[] | undefined> {
	const prefix = `${orgName}/`;
	if (repoName.startsWith(prefix)) {
		repoName = repoName.replace(prefix, '');
	}

	try {
		const result: DependabotVulnResponse =
			await octokit.rest.dependabot.listAlertsForRepo({
				owner: orgName,
				repo: repoName,
				per_page: 100,
				severity: 'critical,high',
				state: 'open',
				sort: 'created',
				direction: 'asc', //retrieve oldest vulnerabilities first
			});

		const alerts = result.data;
		return alerts;
	} catch (error) {
		console.debug(
			`Dependabot - ${repoName}: Could not get alerts. Dependabot may not be enabled.`,
		);
		console.debug(error);
		// Return undefined if dependabot is not enabled, to distinguish from
		// the scenario where it is enabled, but there are no alerts
		return undefined;
	}
}

export async function getDependabotVulnerabilities(
	repos: Repository[],
	orgName: string,
	octokit: Octokit,
) {
	const dependabotVulnerabilities: RepocopVulnerability[] = (
		await Promise.all(
			repos.map(async (repo) => {
				const alerts = await getAlertsForRepo(octokit, orgName, repo.name);
				if (alerts) {
					for (const alert of alerts) {
						await getPRFromAlertTimeline(
							octokit,
							orgName,
							repo.name,
							alert.number,
						);
					}
					return Promise.all(
						alerts.map(async (a) => {
							const pr = await getPRFromAlertTimeline(
								octokit,
								orgName,
								repo.name,
								a.number,
							);
							return dependabotAlertToRepocopVulnerability(
								repo.full_name,
								a,
								pr,
							);
						}),
					);
				}
				return [];
			}),
		)
	).flat();

	console.log(
		`Found ${dependabotVulnerabilities.length} dependabot vulnerabilities across ${repos.length} repos`,
	);

	return dependabotVulnerabilities;
}

export async function getProductionWorkflowUsages(
	client: PrismaClient,
	productionRepos: Repository[],
): Promise<NonEmptyArray<guardian_github_actions_usage>> {
	const actions_usage = await client.guardian_github_actions_usage.findMany({
		where: {
			full_name: { in: productionRepos.map((repo) => repo.full_name) },
		},
	});
	return toNonEmptyArray(actions_usage);
}

export async function getRepositoryCustomProperties(
	client: PrismaClient,
): Promise<NonEmptyArray<github_repository_custom_properties>> {
	const custom_properties =
		await client.github_repository_custom_properties.findMany({});
	return toNonEmptyArray(custom_properties);
}
