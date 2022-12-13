import type { RetrievedObject } from 'common/aws/s3';
import type { Repository } from 'common/model/github';
import type express from 'express';
import { filterRepos } from '../filters';

export const getAllRepos = (
	req: express.Request,
	res: express.Response,
	reposData: RetrievedObject<Repository[]>,
) => {
	const repos = filterRepos(req, reposData.payload);

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
