import type {
	github_repositories,
	github_repository_branches,
	repocop_github_repository_rules,
} from '@prisma/client';
import { daysDifference } from '../date';
import type { RepositoryTeam } from '../query';

/**
 * Apply the following rule to a GitHub repository:
 *   > The default branch name should be "main".
 */
export function repository01(repo: github_repositories): boolean {
	return repo.default_branch === 'main';
}

/**
 * Apply the following rule to a GitHub repository:
 *   > Enable branch protection for the default branch, ensuring changes are reviewed before being deployed.
 */
export function repository02(
	repo: github_repositories,
	branches: github_repository_branches[],
): boolean {
	const branch = branches.find(
		(branch) =>
			branch.repository_id === repo.id && branch.name === repo.default_branch,
	);
	if (branch === undefined) {
		return false;
	} else {
		return branch.protected!;
	}
}

/**
 * Apply the following rule to a GitHub repository:
 *   > Grant at least one GitHub team Admin access - typically, the dev team that own the project.
 *   > Repositories without one of the following topics are exempt: production, testing, documentation.
 */
export function repository04(
	repo: github_repositories,
	teams: RepositoryTeam[],
): boolean {
	const adminTeams = teams.filter(
		({ id, role_name }) => id === repo.id && role_name === 'admin',
	);
	const hasAdminTeam = adminTeams.length > 0;

	// only evaluate repositories with no topic or a relevant topic
	const relevantTopics = ['production', 'testing', 'documentation'];
	const hasRelevantTopic =
		repo.topics.length === 0 ||
		repo.topics.filter((topic) => relevantTopics.includes(topic)).length > 0;

	return hasAdminTeam && hasRelevantTopic;
}

/**
 * Apply the following rule to a GitHub repository:
 *   > Repositories that are no longer used should be archived.
 */
export function repository05(
	repo: github_repositories,
	teams: RepositoryTeam[],
): boolean {
	const isArchived = repo.archived ?? false;

	// Topic is not production, documentation or testing
	const importantTopics = ['production', 'testing', 'documentation'];
	const hasImportantTopic =
		repo.topics.length === 0 ||
		repo.topics.filter((topic) => importantTopics.includes(topic)).length > 0;

	// No commits in the last 365 days.
	const hasRepoBeenRecentlyPushedTo = recentlyPushedTo(repo, 365);

	// Not owned by an external team
	const adminTeams = teams.filter(
		({ id, role_name }) => id === repo.id && role_name === 'admin',
	);
	const hasAdminTeam = adminTeams.length > 0;

	// TODO check no running AWS services

	console.table({
		isArchived,
		hasImportantTopic,
		hasRepoBeenRecentlyPushedTo,
		hasAdminTeam,
	});

	return isArchived && !hasRepoBeenRecentlyPushedTo && !hasImportantTopic;

	// return !hasImportantTopic && !recentlyPushedTo && !hasAdminTeam;
}

function recentlyPushedTo(repo: github_repositories, daysAgo: number): boolean {
	const pushedAt = repo.pushed_at;

	if (!pushedAt) {
		return false;
	}

	const now = new Date();
	const diff = daysDifference(now, pushedAt);

	return diff < daysAgo;
}

/**
 * Apply the following rule to a GitHub repository:
 *   > Repositories should have a topic to help understand what is in production.
 *   > Repositories owned only by non-P&E teams are exempt.
 */
export function repository06(repo: github_repositories): boolean {
	const validTopics = [
		'prototype',
		'learning',
		'hackday',
		'testing',
		'documentation',
		'production',
	];

	return repo.topics.filter((topic) => validTopics.includes(topic)).length > 0;
}

/**
 * Apply rules to a repository as defined in https://github.com/guardian/recommendations/blob/main/best-practices.md.
 */
export function repositoryRuleEvaluation(
	repo: github_repositories,
	allBranches: github_repository_branches[],
	teams: RepositoryTeam[],
): repocop_github_repository_rules {
	return {
		full_name: repo.full_name!,
		repository_01: repository01(repo),
		repository_02: repository02(repo, allBranches),
		repository_04: repository04(repo, teams),
		repository_05: repository05(repo, teams),
		repository_06: repository06(repo),

		// TODO - implement these rules
		repository_03: false,
		repository_07: false,
	};
}
