import type { Account } from '@aws-sdk/client-organizations';
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import type { PrismaClient } from '@prisma/client';
import { awsClientConfig } from 'common/aws';
import type { Audit } from './types';

function numberOfBucketsFromDatabase(client: PrismaClient): Promise<number> {
	return client.aws_s3_buckets.count();
}

async function numberOfBucketsForAwsAccount(
	stage: string,
	accountId: string,
): Promise<number> {
	const client = new S3Client(
		// Use the same IAM Role that CloudQuery uses to eliminate permission issues being the cause of data difference
		awsClientConfig(stage, `arn:aws:iam::${accountId}:role/cloudquery-access`),
	);
	const command = new ListBucketsCommand({});
	const { Buckets } = await client.send(command);
	return Buckets?.length ?? 0;
}

async function numberOfBucketsFromAws(
	stage: string,
	accounts: Account[],
): Promise<number> {
	const promises = accounts.map((account) =>
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- AWS's types are wrong!
		numberOfBucketsForAwsAccount(stage, account.Id!),
	);
	const results = await Promise.all(promises);
	return results.reduce((a, b) => a + b, 0);
}

export async function auditS3Buckets(
	prismaClient: PrismaClient,
	accounts: Account[],
	stage: string,
): Promise<Audit> {
	const db = await numberOfBucketsFromDatabase(prismaClient);
	const aws = await numberOfBucketsFromAws(stage, accounts);
	return {
		name: 'AWS S3 buckets',
		db,
		aws,
	};
}
