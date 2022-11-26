import path from 'path';
import type { S3Client } from '@aws-sdk/client-s3';
import type { RetrievedObject } from 'common/aws/s3';
import { getObject  } from 'common/aws/s3';
import type { Member, Repository, Team } from 'common/model/github';

export interface GitHubData {
	teams: RetrievedObject<Team[]>;
	repos: RetrievedObject<Repository[]>;
	members: RetrievedObject<Member[]>;
}

export const retrieveData = async (s3Client: S3Client, dataBucketName: string, dataKeyPrefix: string): Promise<GitHubData> => {
	const repoFileLocation = path.join(dataKeyPrefix, 'repos.json');
	const teamFileLocation = path.join(dataKeyPrefix, 'teams.json');
	const memberFileLocation = path.join(dataKeyPrefix, 'members.json');
	
	const repos = await getObject<Repository[]>(
		s3Client,
		dataBucketName,
		repoFileLocation,
	);
	
	const teams = await getObject<Team[]>(
		s3Client,
		dataBucketName,
		teamFileLocation,
	);

	const members = await getObject<Member[]>(
		s3Client,
		dataBucketName,
		memberFileLocation,
	);

	return { teams, repos, members }
}