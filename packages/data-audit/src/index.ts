import { PrismaClient } from '@prisma/client';
import { getConfig } from './config';

export async function main() {
	const config = await getConfig();

	const prisma = new PrismaClient({
		datasources: {
			db: {
				url: config.databaseConnectionString,
			},
		},
		...(config.withQueryLogging && {
			log: [
				{
					emit: 'stdout',
					level: 'query',
				},
			],
		}),
	});

	const awsAccounts = await prisma.aws_accounts.count();
	console.log(`There are ${awsAccounts} AWS accounts in the database`);
}
