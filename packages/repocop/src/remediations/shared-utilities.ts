import type { github_teams, view_repo_ownership } from '@prisma/client';

function findTeamSlugFromId(
	id: bigint,
	teams: github_teams[],
): string | undefined {
	const match: github_teams | undefined = teams.find((team) => team.id === id);
	return match?.slug ?? undefined;
}

export function findContactableOwners(
	repo: string,
	allRepoOwners: view_repo_ownership[],
	teams: github_teams[],
): string[] {
	const owners = allRepoOwners.filter((owner) => owner.full_name === repo);
	const teamSlugs = owners
		.map((owner) => findTeamSlugFromId(owner.github_team_id, teams))
		.filter((slug): slug is string => !!slug);
	return teamSlugs;
}

export function removeRepoOwner(fullRepoName: string): string {
	const reponame = fullRepoName.split('/')[1];
	return reponame ?? '';
}
