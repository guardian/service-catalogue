import type { RetrievedObject } from 'common/aws/s3';
import type { Repository } from 'common/model/github';
import type express from 'express';

export const getAllRepos = (
	req: express.Request,
	res: express.Response,
	reposData: RetrievedObject<Repository[]>,
) => {
	if (typeof req.query.name !== 'undefined') {
		const searchString: string = req.query.name.toString();
		const jsonResponse = reposData.payload.filter((item) =>
			item.name.match(searchString),
		);
		if (jsonResponse.length !== 0) {
			res.status(200).json(jsonResponse);
		} else {
			return res.status(200).json({
				searchString: searchString,
				info: 'no results found in repos',
			});
		}
	} else {
		return res.status(200).json(reposData);
	}
};

export const getRepoByName = (
	req: express.Request,
	res: express.Response,
	reposData: RetrievedObject<Repository[]>,
) => {
	const jsonResponse = reposData.payload.filter(
		(item) => item.name === req.params.name,
	);
	if (jsonResponse.length !== 0) {
		return res.status(200).json(jsonResponse);
	} else {
		return res
			.status(404)
			.json({ repoName: req.params.name, info: 'Repository not found' });
	}
};
