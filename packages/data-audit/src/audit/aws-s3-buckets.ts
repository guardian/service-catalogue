import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import type { PrismaClient } from '@prisma/client';
import { awsClientConfig } from 'common/aws';
import type { Audit } from './types';

function numberOfBucketsFromDatabase(client: PrismaClient): Promise<number> {
	return client.aws_s3_buckets.count();
}

async function numberOfBucketsFromAws(stage: string): Promise<number> {
	const client = new S3Client(awsClientConfig(stage));
	const command = new ListBucketsCommand({});
	const { Buckets } = await client.send(command);
	return Buckets?.length ?? 0;
}

export async function auditS3Buckets(
	prismaClient: PrismaClient,
	stage: string,
): Promise<Audit> {
	const db = await numberOfBucketsFromDatabase(prismaClient);
	const aws = await numberOfBucketsFromAws(stage);
	return {
		name: 'AWS S3 buckets',
		db,
		aws,
	};
}
