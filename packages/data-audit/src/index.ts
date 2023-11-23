import type { Account } from '@aws-sdk/client-organizations';
import {
	OrganizationsClient,
	paginateListAccounts,
} from '@aws-sdk/client-organizations';
import { awsClientConfig } from 'common/aws';
import { getPrismaClient } from 'common/database';
import { auditAwsAccounts } from './audit/aws-accounts';
import { auditS3Buckets } from './audit/aws-s3-buckets';
import { auditResult } from './audit/types';
import { getConfig } from './config';

async function getAwsAccounts(stage: string) {
	const client = new OrganizationsClient(awsClientConfig(stage));

	const accounts: Account[] = [];

	for await (const page of paginateListAccounts(
		{
			client,
			pageSize: 20,
		},
		{},
	)) {
		accounts.push(...(page.Accounts ?? []));
	}

	return accounts;
}

export async function main() {
	const config = await getConfig();
	const prismaClient = getPrismaClient(config);

	const awsAccounts = await getAwsAccounts(config.stage);
	const rootAccount = 'Guardian Web Systems';

	const awsAccountsToQuery = awsAccounts
		.filter((_) => _.Status === 'ACTIVE') // Only query active accounts
		.filter((_) => _.Name !== rootAccount); // Role to assume when querying account doesn't exist for the root account

	const awsAccountAudit = await auditAwsAccounts(prismaClient, awsAccounts);
	const awsS3BucketAudit = await auditS3Buckets(
		prismaClient,
		awsAccountsToQuery,
		config.stage,
	);

	console.log(auditResult(awsAccountAudit));
	console.log(auditResult(awsS3BucketAudit));
}
