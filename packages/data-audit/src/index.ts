import { getPrismaClient } from 'common/database';
import { auditAwsAccounts } from './audit/aws-accounts';
import { auditS3Buckets } from './audit/aws-s3-buckets';
import { auditResult } from './audit/types';
import { getConfig } from './config';

export async function main() {
	const config = await getConfig();
	const prismaClient = getPrismaClient(config);

	const awsAccounts = await auditAwsAccounts(prismaClient, config.stage);
	const awsS3Buckets = await auditS3Buckets(prismaClient, config.stage);

	console.log(auditResult(awsAccounts));
	console.log(auditResult(awsS3Buckets));
}
