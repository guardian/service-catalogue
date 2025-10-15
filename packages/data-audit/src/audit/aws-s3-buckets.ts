import type { Account } from '@aws-sdk/client-organizations';
import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { awsClientConfig } from 'common/aws.js';
import type { PrismaClient } from 'common/generated/prisma/client.js';
import type { Audit } from './database.js';

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
	const cloudquery = await numberOfBucketsFromDatabase(prismaClient);
	const vendor = await numberOfBucketsFromAws(stage, accounts);
	return {
		name: 'AWS S3 buckets',
		cloudquery_total: cloudquery,
		vendor_total: vendor,
	};
}
