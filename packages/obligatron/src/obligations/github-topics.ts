import type { PrismaClient, view_repo_ownership } from '@prisma/client';
import { toNonEmptyArray } from 'common/functions.js';
import {
	getRepoOwnership,
	getRepositories,
} from 'common/src/database-queries.js';
import type { Repository } from 'common/src/types.js';
import type { ObligationResult } from './index.js';

export function topicsIncludesProductionStatus(
	topics: string[],
	productionStatuses: string[],
): boolean {
	return productionStatuses.some((status) => topics.includes(status));
}

export function repoToObligationResult(
	repo: Repository,
	allOwners: view_repo_ownership[],
): ObligationResult {
	const teamSlugs = allOwners
		.filter((o) => o.full_repo_name === repo.full_name)
		.map((x) => x.github_team_slug);

	return {
		resource: repo.full_name,
		reason: `Repository does not have topics indicating production status. Topics: ${repo.topics.join(', ')}`,
		url: `https://github.com/${repo.full_name}`,
		contacts: { slugs: teamSlugs },
	};
}

const getExternalTeams = async (prisma: PrismaClient): Promise<string[]> => {
	const teams = await prisma.guardian_non_p_and_e_github_teams.findMany();
	return toNonEmptyArray(teams.map((t) => t.team_name));
};

// This function filters out repos that are owned exclusively by teams outsude of P&E.
// It will keep repos that have no owners, or have at least one owning team inside the department
export function removeExternallyOwnedRepos(
	repos: Repository[],
	repoOwners: view_repo_ownership[],
	externalTeams: string[],
): Repository[] {
	const externalTeamSlugs = new Set(externalTeams);
	return repos.filter((repo) => {
		const owners = repoOwners.filter(
			(owner) => owner.full_repo_name === repo.full_name,
		);
		console.log(
			`Repo ${repo.full_name} has owners: ${owners.map((o) => o.github_team_slug).join(', ')}`,
		);
		// Include repos with no owners, or with at least one non-external owner
		return (
			owners.length === 0 ||
			owners.some((owner) => !externalTeamSlugs.has(owner.github_team_slug))
		);
	});
}

export async function evaluateRepoTopics(
	prisma: PrismaClient,
): Promise<ObligationResult[]> {
	const productionStatuses: string[] = (
		await prisma.guardian_production_status.findMany({
			select: {
				status: true,
			},
		})
	).map((status) => status.status);

	const reposWithNoStatus = (await getRepositories(prisma, [])).filter(
		(repo) =>
			!repo.archived &&
			!topicsIncludesProductionStatus(repo.topics, productionStatuses),
	);

	const repoOwners = await getRepoOwnership(prisma);
	const externalTeams = await getExternalTeams(prisma);

	const internalReposWithoutProductionStatus = removeExternallyOwnedRepos(
		reposWithNoStatus,
		repoOwners,
		externalTeams,
	);

	return internalReposWithoutProductionStatus.map((repo) =>
		repoToObligationResult(repo, repoOwners),
	);
}
