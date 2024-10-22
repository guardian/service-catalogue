import type { view_repo_ownership } from '@prisma/client';
import type { Team } from '../types';

function findTeamSlugFromId(id: bigint, teams: Team[]): string | undefined {
	const match: Team | undefined = teams.find((team) => team.id === id);
	return match?.slug ?? undefined;
}

export function findContactableOwners( //TODO we don't need teams any more, view_repo_ownership has the team slug
	repo: string,
	allRepoOwners: view_repo_ownership[],
	teams: Team[],
): string[] {
	const owners = allRepoOwners.filter((owner) => owner.full_repo_name === repo);
	const teamSlugs = owners
		.map((owner) => findTeamSlugFromId(owner.github_team_id, teams))
		.filter((slug): slug is string => !!slug);
	return teamSlugs;
}

export function removeRepoOwner(fullRepoName: string): string {
	const reponame = fullRepoName.split('/')[1];
	return reponame ?? '';
}
