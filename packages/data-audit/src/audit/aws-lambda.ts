import type { FunctionConfiguration } from '@aws-sdk/client-lambda';
import { LambdaClient, paginateListFunctions } from '@aws-sdk/client-lambda';
import type { Account } from '@aws-sdk/client-organizations';
import type { PrismaClient } from '@prisma/client';
import { AWS_REGIONS, awsClientConfig } from 'common/aws.js';
import type { Audit } from './database.js';

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function numberOfLambdasFromDatabase(client: PrismaClient): Promise<number> {
	return client.aws_lambda_functions.count();
}

async function numberOfLambdaFunctionsForAwsAccount(
	stage: string,
	accountId: string,
	region: string,
): Promise<number> {
	const client = new LambdaClient(
		// Use the same IAM Role that CloudQuery uses to eliminate permission issues being the cause of data difference
		awsClientConfig(
			stage,
			`arn:aws:iam::${accountId}:role/cloudquery-access`,
			region,
		),
	);

	const functions: FunctionConfiguration[] = [];

	for await (const page of paginateListFunctions(
		{ client, pageSize: 50 },
		{},
	)) {
		functions.push(...(page.Functions ?? []));

		// (attempt to) avoid rate limiting by sleeping for 3 seconds between pages
		await sleep(3000);
	}

	const total = functions.length;

	console.log(
		JSON.stringify({
			message: `Found ${total} lambda functions in region ${region} for account ${accountId}`,
			account: accountId,
			region,
			client: `${accountId}:${region}`,
			total,
		}),
	);

	return total;
}

async function numberOfLambdaFunctionsFromAws(
	stage: string,
	accounts: Account[],
	regions: string[],
): Promise<number> {
	const promises = accounts.flatMap((account) => {
		return regions.map((region) => {
			return numberOfLambdaFunctionsForAwsAccount(stage, account.Id!, region);
		});
	});
	const results = await Promise.all(promises);
	return results.reduce((a, b) => a + b, 0);
}

export async function auditLambdaFunctions(
	prismaClient: PrismaClient,
	accounts: Account[],
	stage: string,
): Promise<Audit> {
	const cloudquery = await numberOfLambdasFromDatabase(prismaClient);
	const vendor = await numberOfLambdaFunctionsFromAws(
		stage,
		accounts,
		AWS_REGIONS,
	);
	return {
		name: 'AWS Lambda functions',
		cloudquery_total: cloudquery,
		vendor_total: vendor,
	};
}
