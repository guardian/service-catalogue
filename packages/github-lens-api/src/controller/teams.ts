import type { RetrievedObject } from 'common/aws/s3';
import type { Team } from 'common/model/github';
import type express from 'express';
import { filterRepos } from '../filters';

export const getAllTeams = (
	req: express.Request,
	res: express.Response,
	teamsData: RetrievedObject<Team[]>,
) => {
	const filteredTeams = teamsData.payload.map((team) => {
		return { ...team, repos: filterRepos(req, team.repos) };
	});

	const filteredTeamsData = { ...teamsData, payload: filteredTeams };

	res.status(200).json(filteredTeamsData);
};

export const getTeamBySlug = (
	req: express.Request,
	res: express.Response,
	teamsData: RetrievedObject<Team[]>,
) => {
	const team = teamsData.payload.find((item) => item.slug === req.params.slug);

	if (team) {
		const filteredTeam = { ...team, repos: filterRepos(req, team.repos) };

		res.status(200).json({ ...teamsData, payload: filteredTeam });
	} else {
		res.status(404).json({ teamSlug: req.params.slug, info: 'Team not found' });
	}
};
