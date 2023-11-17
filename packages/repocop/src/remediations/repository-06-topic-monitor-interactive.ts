import type { PublishBatchRequestEntry } from '@aws-sdk/client-sns';
import type { repocop_github_repository_rules } from '@prisma/client';

export function findPotentialInteractives(
	evaluatedRepos: repocop_github_repository_rules[],
): string[] {
	return evaluatedRepos
		.filter((repo) => !repo.topics)
		.map((repo) => repo.full_name);
}

export function createBatchEntry(string: string): PublishBatchRequestEntry {
	const shortString = string.split('/')[1];
	if (!shortString) {
		throw new Error(`Invalid repo name: ${string}`);
	}
	return {
		Id: shortString.replace(/\W/g, ''),
		Message: shortString,
	};
}
