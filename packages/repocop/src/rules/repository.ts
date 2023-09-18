import type {
	github_repositories,
	github_repository_branches,
	repocop_github_repository_rules,
} from '@prisma/client';
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
	// Repos that have explicitly been classified as these topics are exempt.
	// Any other repos, regardless of topic, need to be owned by a team, or assigned one of these topics.
	const exemptedTopics = ['prototype', 'learning', 'hackday'];
	const isExempt =
		repo.topics.filter((topic) => exemptedTopics.includes(topic)).length > 0;

	const adminTeams = teams.filter(
		({ id, role_name }) => id === repo.id && role_name === 'admin',
	);
	const hasAdminTeam = adminTeams.length > 0;

	return isExempt || hasAdminTeam;
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

		// TODO - implement these rules
		repository_03: false,
		repository_04: repository04(repo, teams),
		repository_05: null,
		repository_06: repository06(repo),
		repository_07: null,
		evaluated_on: new Date(),
	};
}
