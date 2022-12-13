import type { Repository, Team } from 'common/model/github';
import type express from 'express';
import { engineeringTeamSlugs, validTeamSlugs } from './validGithubTeams';

interface TFilter<T> {
	paramName: string;
	fn: (r: T, paramValue: string) => boolean;
}

const filterT = <T>(
	req: express.Request,
	t: T[],
	filters: Array<TFilter<T>>,
): T[] => {
	return t.filter((t) => {
		return filters.every((filter) => {
			const paramValue = req.query[filter.paramName];
			if (paramValue === undefined) return true; // ignore filter fn if param unset
			return filter.fn(t, paramValue.toString());
		});
	});
};

export type TeamFilter = TFilter<Team>;
export type RepoFilter = TFilter<Repository>;

export const repoFilters: RepoFilter[] = [
	{
		paramName: 'repoName',
		fn: (repo: Repository, paramValue: string) => !!repo.name.match(paramValue),
	},
	{
		paramName: 'repoNotOwned',
		fn: (repo: Repository) => repo.owners.length === 0,
	},
	{
		paramName: 'repoIsArchived',
		fn: (repo: Repository) => repo.archived ?? false,
	},
	{
		paramName: 'repoIsNotArchived',
		fn: (repo: Repository) => !(repo.archived ?? false),
	},
];

export const teamFilters: TeamFilter[] = [
	{
		paramName: 'teamName',
		fn: (team: Team, paramValue: string) => !!team.name.match(paramValue),
	},
	{
		paramName: 'teamIsEngineering',
		fn: (team: Team) => engineeringTeamSlugs.includes(team.slug),
	},
	{
		paramName: 'teamIsValid',
		fn: (team: Team) => validTeamSlugs.includes(team.slug),
	},
];

export const filterRepos = (
	req: express.Request,
	repos: Repository[],
): Repository[] => filterT(req, repos, repoFilters);

export const filterTeams = (req: express.Request, teams: Team[]): Team[] =>
	filterT(req, teams, teamFilters);
