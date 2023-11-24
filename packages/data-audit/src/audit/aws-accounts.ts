import type { Account } from '@aws-sdk/client-organizations';
import type { PrismaClient } from '@prisma/client';
import type { Audit } from './types';

function numberOfAwsAccountsFromDatabase(
	client: PrismaClient,
): Promise<number> {
	return client.aws_accounts.count();
}

export async function auditAwsAccounts(
	prismaClient: PrismaClient,
	accountIds: Account[],
): Promise<Audit> {
	const db = await numberOfAwsAccountsFromDatabase(prismaClient);
	const aws = accountIds.length;
	return {
		name: 'AWS Accounts',
		db,
		aws,
	};
}
