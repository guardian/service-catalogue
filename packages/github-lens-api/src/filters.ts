import type { Repository } from 'common/model/github';
import type express from 'express';

export interface RepoFilter {
	paramName: string;
	fn: (r: Repository, paramValue: string) => boolean;
}

export const repoFilters: RepoFilter[] = [
	{
		paramName: 'repoName',
		fn: (repo: Repository, paramValue: string) => !!repo.name.match(paramValue),
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

export const filterRepos = (
	req: express.Request,
	repos: Repository[],
): Repository[] => {
	return repos.filter((repo) => {
		return repoFilters.every((filter) => {
			const paramValue = req.query[filter.paramName];
			if (paramValue === undefined) return true; // ignore filter fn if param unset
			return filter.fn(repo, paramValue.toString());
		});
	});
};

// TODO: If we add further filters, suggest this format
// export interface TeamFilter {
// 	paramName: string;
// 	fn: (r: Team, paramValue: string) => boolean;
// }

// export const teamFilters: TeamFilter[] = [
// 	{
// 		paramName: 'teamName',
// 		fn: (team: Team, paramValue: string) => true,
// 	},
// ];
