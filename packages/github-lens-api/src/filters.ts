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
		paramName: 'repoIsOwned',
		fn: (repo: Repository, paramValue: string) => {
			const repoIsOwned = repo.owners.length !== 0;
			return paramValue === 'false' ? !repoIsOwned : repoIsOwned;
		},
	},
	{
		paramName: 'repoIsArchived',
		fn: (repo: Repository, paramValue: string) => {
			const repoIsArchived = repo.archived ?? false;
			return paramValue === 'false' ? !repoIsArchived : repoIsArchived;
		},
	},
];

export const teamFilters: TeamFilter[] = [
	{
		paramName: 'teamName',
		fn: (team: Team, paramValue: string) => !!team.name.match(paramValue),
	},
	{
		paramName: 'teamIsEngineering',
		fn: (team: Team, paramValue: string) => {
			const teamIsEngineering = engineeringTeamSlugs.includes(team.slug);
			return paramValue === 'false' ? !teamIsEngineering : teamIsEngineering;
		},
	},
	{
		paramName: 'teamIsValid',
		fn: (team: Team, paramValue: string) => {
			const teamIsValid = validTeamSlugs.includes(team.slug);
			return paramValue === 'false' ? !teamIsValid : teamIsValid;
		},
	},
];

export const filterRepos = (
	req: express.Request,
	repos: Repository[],
): Repository[] => filterT(req, repos, repoFilters);

export const filterTeams = (req: express.Request, teams: Team[]): Team[] =>
	filterT(req, teams, teamFilters);
