import type {
	github_languages,
	github_repository_branches,
	PrismaClient,
	snyk_issues,
	view_repo_ownership,
} from '@prisma/client';
import type { GotBodyOptions } from 'got';
import get from 'got';
import type { Config } from './config';
import type {
	AwsCloudFormationStack,
	NonEmptyArray,
	Repository,
	SnykIssue,
	SnykOrgResponse,
	SnykProject,
	SnykProjectsResponse,
	Team,
} from './types';
import { toNonEmptyArray } from './utils';

export async function getRepositories(
	client: PrismaClient,
	ignoredRepositoryPrefixes: string[],
): Promise<Repository[]> {
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

export async function getRepoOwnership(
	client: PrismaClient,
): Promise<NonEmptyArray<view_repo_ownership>> {
	const data = await client.view_repo_ownership.findMany();
	console.log(`Found ${data.length} repo ownership records.`);
	return toNonEmptyArray(data);
}

export async function getStacks(
	client: PrismaClient,
	// ): Promise<NonEmptyArray<AwsCloudFormationStack>> {
): Promise<AwsCloudFormationStack[]> {
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
	// return toNonEmptyArray(stacks);
	return stacks;
}

export async function getSnykIssues(
	client: PrismaClient,
): Promise<SnykIssue[]> {
	return (await client.snyk_issues.findMany({})).map((i) => {
		return {
			id: i.id,
			attributes: i.attributes as unknown as SnykIssue['attributes'],
		};
	});
}

//TODO get snyk projects using prisma

export async function getRepositoryLanguages(
	client: PrismaClient,
): Promise<NonEmptyArray<github_languages>> {
	return toNonEmptyArray(await client.github_languages.findMany({}));
}

function projectsURL(orgId: string, snykApiVersion: string): string {
	return `https://api.snyk.io/rest/orgs/${orgId}/projects?version=${snykApiVersion}&limit=100`;
}

function snykRequestOptions(config: Config): GotBodyOptions<string> {
	return {
		headers: {
			Authorization: `token ${config.snykReadOnlyKey}`,
		},
	};
}

export async function getSnykOrgs(config: Config): Promise<SnykOrgResponse> {
	const getOrgsUrl = `https://api.snyk.io/api/orgs?version=${config.snykApiVersion}`;
	const resp = await get(getOrgsUrl, snykRequestOptions(config));
	const snykOrgResponse = JSON.parse(resp.body) as SnykOrgResponse;
	console.debug('Orgs found: ', snykOrgResponse.orgs.length);
	return snykOrgResponse;
}

export async function getProjectsForOrg(
	orgId: string,
	config: Config,
): Promise<SnykProject[]> {
	const opts = snykRequestOptions(config);

	const projectsResponse = await get(
		projectsURL(orgId, config.snykApiVersion),
		opts,
	);
	const parsedResponse = JSON.parse(
		projectsResponse.body,
	) as SnykProjectsResponse;

	const data = parsedResponse.data;

	let next = parsedResponse.links?.next;

	while (next) {
		const nextResponse = await get(`https://api.snyk.io${next}`, opts);
		const nextParsedResponse = JSON.parse(
			nextResponse.body,
		) as SnykProjectsResponse;
		const nextTags = nextParsedResponse.data;

		data.push(...nextTags);
		next = nextParsedResponse.links?.next;
	}

	console.debug(`Snyk projects found for org ${orgId}: `, data.length);
	return data;
}
