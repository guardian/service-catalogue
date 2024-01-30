import type {
	github_languages,
	github_repository_branches,
	github_workflows,
	PrismaClient,
	snyk_projects,
	view_repo_ownership,
} from '@prisma/client';
import type { GotBodyOptions } from 'got';
import get from 'got';
import type { Config } from './config';
import type {
	AwsCloudFormationStack,
	Repository,
	SnykOrgResponse,
	SnykProject,
	SnykProjectsResponse,
	Team,
	TeamRepository,
} from './types';

export type NonEmptyArray<T> = [T, ...T[]];

export function toNonEmptyArray<T>(value: T[]): NonEmptyArray<T> {
	if (value.length === 0) {
		throw new Error(`Expected a non-empty array. Source table may be empty.`);
	}
	return value as NonEmptyArray<T>;
}

export async function getRepositories(
	client: PrismaClient,
	ignoredRepositoryPrefixes: string[],
): Promise<Repository[]> {
	console.log('Discovering repositories');
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

	console.log(`Found ${repositories.length} repositories`);
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
	console.log(`Parsed ${teams.length} teams.`);
	return toNonEmptyArray(teams);
};

export async function getTeamRepositories(
	client: PrismaClient,
): Promise<NonEmptyArray<TeamRepository>> {
	const data = await client.github_team_repositories.findMany({
		select: {
			id: true,
			role_name: true,
			team_id: true,
		},
	});
	return toNonEmptyArray(data.map((t) => t as TeamRepository));
}

export async function getRepoOwnership(
	client: PrismaClient,
): Promise<NonEmptyArray<view_repo_ownership>> {
	const data = await client.view_repo_ownership.findMany();
	console.log(`Found ${data.length} repo ownership records.`);
	return toNonEmptyArray(data);
}

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

	console.log(`Found ${stacks.length} stacks.`);
	return toNonEmptyArray(stacks);
}

//allow it to return an empty array while getWorkflowFiles exists
export async function getSnykProjects(
	client: PrismaClient,
): Promise<snyk_projects[]> {
	return await client.snyk_projects.findMany({});
}

export async function getRepositoryLanguages(
	client: PrismaClient,
): Promise<NonEmptyArray<github_languages>> {
	return toNonEmptyArray(await client.github_languages.findMany({}));
}

export async function getWorkflowFiles(
	client: PrismaClient,
): Promise<NonEmptyArray<github_workflows>> {
	return toNonEmptyArray(await client.github_workflows.findMany({}));
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

export async function getSnykOrgs(
	config: Config,
	snykApiVersion: string,
): Promise<SnykOrgResponse> {
	const getOrgsUrl = `https://api.snyk.io/api/orgs?version=${snykApiVersion}`;
	const resp = await get(getOrgsUrl, snykRequestOptions(config));
	console.log('Status code: ', resp.statusCode);

	const snykOrgResponse = JSON.parse(resp.body) as SnykOrgResponse;
	console.log('Orgs found: ', snykOrgResponse.orgs.length);
	return snykOrgResponse;
}

export async function getProjectsForOrg(
	orgId: string,
	snykApiVersion: string,
	config: Config,
): Promise<SnykProject[]> {
	const opts = snykRequestOptions(config);

	const projectsResponse = await get(projectsURL(orgId, snykApiVersion), opts);
	console.log('Status code: ', projectsResponse.statusCode);
	const parsedResponse = JSON.parse(
		projectsResponse.body,
	) as SnykProjectsResponse;

	console.log(parsedResponse.links?.next);

	const data = parsedResponse.data;

	console.log(`Projects found for org ${orgId}: `, data.length);

	let next = parsedResponse.links?.next;

	while (next) {
		console.log('Next page found: ', next);
		const nextResponse = await get(`https://api.snyk.io${next}`, opts);
		console.log('Status code: ', nextResponse.statusCode);
		const nextParsedResponse = JSON.parse(
			nextResponse.body,
		) as SnykProjectsResponse;
		const nextTags = nextParsedResponse.data;

		data.push(...nextTags);

		console.log(`Projects found for org ${orgId}: `, data.length);
		next = nextParsedResponse.links?.next;
	}

	return data;
}
