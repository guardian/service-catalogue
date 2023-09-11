import type {
	github_repositories,
	github_repository_branches,
	repocop_github_repository_rules,
} from '@prisma/client';

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
 * Apply rules to a repository as defined in https://github.com/guardian/recommendations/blob/main/best-practices.md.
 */
export function repositoryRuleEvaluation(
	repo: github_repositories,
	allBranches: github_repository_branches[],
): repocop_github_repository_rules {
	return {
		full_name: repo.full_name!,
		repository_01: repository01(repo),
		repository_02: repository02(repo, allBranches),

		// TODO - implement these rules
		repository_03: false,
		repository_04: false,
		repository_05: false,
		repository_06: false,
		repository_07: false,
	};
}
