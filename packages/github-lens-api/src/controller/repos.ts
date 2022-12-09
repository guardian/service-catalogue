import type { RetrievedObject } from 'common/aws/s3';
import type { Repository } from 'common/model/github';
import type express from 'express';

interface Filter {
	paramName: string;
	fn: (r: Repository, paramValue: string) => boolean;
}

export const getAllRepos = (
	req: express.Request,
	res: express.Response,
	reposData: RetrievedObject<Repository[]>,
) => {
	const filters: Filter[] = [
		{
			paramName: 'name',
			fn: (repo: Repository, paramValue: string) =>
				!!repo.name.match(paramValue),
		},
		{
			paramName: 'isArchived',
			fn: (repo: Repository) => repo.archived ?? false,
		},
	];

	const repos = reposData.payload.filter((repo) => {
		return filters.every((filter) => {
			const paramValue = req.query[filter.paramName];
			if (paramValue === undefined) return true; // ignore filter fn if param unset
			return filter.fn(repo, paramValue.toString());
		});
	});

	res.status(200).json({ ...reposData, payload: repos });
};

export const getRepoByName = (
	req: express.Request,
	res: express.Response,
	reposData: RetrievedObject<Repository[]>,
) => {
	const repo = reposData.payload.find((item) => item.name === req.params.name);

	if (repo) {
		return res.status(200).json({ ...reposData, payload: repo });
	}

	return res
		.status(404)
		.json({ repoName: req.params.name, info: 'Repository not found' });
};
