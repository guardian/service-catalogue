import type { RetrievedObject } from 'common/aws/s3';
import type { Member } from 'common/model/github';
import type express from 'express';

export const getMembers = (
	req: express.Request,
	res: express.Response,
	membersData: RetrievedObject<Member[]>,
) => {
	res.status(200).json(membersData);
};

export const getMembersByLogin = (
	req: express.Request,
	res: express.Response,
	membersData: RetrievedObject<Member[]>,
) => {
	const member = membersData.payload.filter(
		(item) => item.login === req.params.login,
	);
	if (member.length !== 0) {
		res.status(200).json({ ...membersData, payload: member[0] });
	} else {
		res
			.status(404)
			.json({ memberLogin: req.params.login, info: 'Member not found' });
	}
};
