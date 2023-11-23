import {
	OrganizationsClient,
	paginateListAccounts,
} from '@aws-sdk/client-organizations';
import type { PrismaClient } from '@prisma/client';
import { awsClientConfig } from 'common/aws';
import { getPrismaClient } from 'common/database';
import type { Config } from './config';
import { getConfig } from './config';

function numberOfAwsAccountsFromDatabase(
	client: PrismaClient,
): Promise<number> {
	return client.aws_accounts.count();
}

async function numberOfAwsAccountsFromAws(config: Config): Promise<number> {
	const client = new OrganizationsClient(awsClientConfig(config.stage));

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

export async function main() {
	const config = await getConfig();
	const prismaClient = getPrismaClient(config);

	const totalFromDb = await numberOfAwsAccountsFromDatabase(prismaClient);
	const totalFromAws = await numberOfAwsAccountsFromAws(config);

	const status = totalFromDb === totalFromAws ? 'PASS' : 'FAIL';
	console.log(
		`${status} AWS accounts check. DB: ${totalFromDb} AWS: ${totalFromAws}`,
	);
}
