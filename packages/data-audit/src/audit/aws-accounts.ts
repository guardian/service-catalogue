import {
	OrganizationsClient,
	paginateListAccounts,
} from '@aws-sdk/client-organizations';
import type { PrismaClient } from '@prisma/client';
import { awsClientConfig } from 'common/aws';
import type { Audit } from './types';

function numberOfAwsAccountsFromDatabase(
	client: PrismaClient,
): Promise<number> {
	return client.aws_accounts.count();
}

async function numberOfAwsAccountsFromAws(stage: string): Promise<number> {
	const client = new OrganizationsClient(awsClientConfig(stage));

	let total = 0;
	for await (const page of paginateListAccounts(
		{
			client,
			pageSize: 20,
		},
		{},
	)) {
		total += page.Accounts?.length ?? 0;
	}
	return total;
}

export async function auditAwsAccounts(
	prismaClient: PrismaClient,
	stage: string,
): Promise<Audit> {
	const db = await numberOfAwsAccountsFromDatabase(prismaClient);
	const aws = await numberOfAwsAccountsFromAws(stage);
	return {
		name: 'AWS Accounts',
		db,
		aws,
	};
}
