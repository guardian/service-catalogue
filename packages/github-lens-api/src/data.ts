import path from 'path';
import type { S3Client } from '@aws-sdk/client-s3';
import type { RetrievedObject } from 'common/aws/s3';
import { getObject  } from 'common/aws/s3';
import type { Member, Repository, Team } from 'common/model/github';

export interface GitHubData {
	teams?: RetrievedObject<Team[]>;
	repos?: RetrievedObject<Repository[]>;
	members?: RetrievedObject<Member[]>;
}

export const retrieveData = async (s3Client: S3Client, dataBucketName: string, dataKeyPrefix: string): Promise<GitHubData> => {
	const getRetrievedData = async <T>(objectName: string) => {
		const fileLocation = path.join(dataKeyPrefix, `${objectName}.json`);
		return await getObject<T>(
			s3Client,
			dataBucketName,
			fileLocation,
		).catch((error) => {
			const message = error instanceof Error ? error.message : String(error);
			console.error(message);

			return Promise.resolve(undefined);
		})
	}

	return {
		repos: await getRetrievedData<Repository[]>('repos'),
		teams: await getRetrievedData<Team[]>('teams'),
		members: await getRetrievedData<Member[]>('members'),
	}
}