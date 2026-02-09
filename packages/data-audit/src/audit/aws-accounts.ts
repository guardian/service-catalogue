import type { Account } from '@aws-sdk/client-organizations';
import type { PrismaClient } from 'common/prisma-client/client.js';
import type { Audit } from './database.js';

function numberOfAwsAccountsFromDatabase(
	client: PrismaClient,
): Promise<number> {
	return client.aws_accounts.count();
}

export async function auditAwsAccounts(
	prismaClient: PrismaClient,
	accountIds: Account[],
): Promise<Audit> {
	const cloudquery = await numberOfAwsAccountsFromDatabase(prismaClient);
	const vendor = accountIds.length;
	return {
		name: 'AWS Accounts',
		cloudquery_total: cloudquery,
		vendor_total: vendor,
	};
}
