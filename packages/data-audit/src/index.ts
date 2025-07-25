import type { Account } from '@aws-sdk/client-organizations';
import {
	OrganizationsClient,
	paginateListAccounts,
} from '@aws-sdk/client-organizations';
import { awsClientConfig } from 'common/aws.js';
import { getPrismaClient } from 'common/src/database-setup.js';
import { auditAwsAccounts } from './audit/aws-accounts.js';
import { auditLambdaFunctions } from './audit/aws-lambda.js';
import { auditS3Buckets } from './audit/aws-s3-buckets.js';
import { saveAudits } from './audit/database.js';
import { getConfig } from './config.js';

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
	const awsLambdaAudit = await auditLambdaFunctions(
		prismaClient,
		awsAccountsToQuery,
		config.stage,
	);

	await saveAudits(prismaClient, [
		awsAccountAudit,
		awsS3BucketAudit,
		awsLambdaAudit,
	]);
}
