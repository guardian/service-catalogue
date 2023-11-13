import type { repocop_github_repository_rules } from '@prisma/client';

export function findPotentialInteractives(
	evaluatedRepos: repocop_github_repository_rules[],
): string[] {
	return evaluatedRepos
		.filter((repo) => !repo.topics)
		.map((repo) => repo.full_name);
}
