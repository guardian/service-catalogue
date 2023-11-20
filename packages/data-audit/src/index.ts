import {
	OrganizationsClient,
	paginateListAccounts,
} from '@aws-sdk/client-organizations';
import type { PrismaClient } from '@prisma/client';
import AWS from 'aws-sdk';
import { awsClientConfig } from 'common/aws';
import { getPrismaClient } from 'common/database';
import type { Config } from './config';
import { getConfig } from './config';

function numberOfAwsAccountsFromDatabase(
	client: PrismaClient,
): Promise<number> {
	return client.aws_accounts.count();
}

async function getNumberOfBuckets() {
	const s3 = new AWS.S3();
	const buckets = await s3.listBuckets().promise();
	if (buckets.Buckets) return buckets.Buckets.length;
	return 0;
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

	const numberOfBuckets = await getNumberOfBuckets();
	console.log(`The number of buckets is: ${numberOfBuckets}`);
}
