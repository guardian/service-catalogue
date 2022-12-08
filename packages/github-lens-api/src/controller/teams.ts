import type { RetrievedObject } from 'common/aws/s3';
import type { Team } from 'common/model/github';
import type express from 'express';

export const getAllTeams = (
	req: express.Request,
	res: express.Response,
	teamsData: RetrievedObject<Team[]>,
) => {
	return res.status(200).json(teamsData);
};

export const getTeamBySlug = (
	req: express.Request,
	res: express.Response,
	teamsData: RetrievedObject<Team[]>,
) => {
	const team = teamsData.payload.filter(
		(item) => item.slug === req.params.slug,
	);
	if (team.length !== 0) {
		res.status(200).json({ ...teamsData, payload: team[0] });
	} else {
		res.status(404).json({ teamSlug: req.params.slug, info: 'Team not found' });
	}
};
