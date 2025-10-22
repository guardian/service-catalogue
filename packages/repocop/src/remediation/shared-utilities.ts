import type { view_repo_ownership } from 'common/generated/prisma/client.js';

export function findContactableOwners(
	repo: string,
	allRepoOwners: view_repo_ownership[],
): string[] {
	const owners = allRepoOwners.filter((owner) => owner.full_repo_name === repo);
	const teamSlugs = owners.map((owner) => owner.github_team_slug);
	return teamSlugs;
}

export function removeRepoOwner(fullRepoName: string): string {
	const reponame = fullRepoName.split('/')[1];
	return reponame ?? '';
}
