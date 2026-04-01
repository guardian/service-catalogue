import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'common/prisma-client/client.js';
import type { PrismaConfig } from 'common/src/database-setup.js';

export function getPrismaClient(config: PrismaConfig): PrismaClient {
	const adapter = new PrismaPg({
		connectionString: config.databaseConnectionString,
	});

	return new PrismaClient({
		adapter,
		...(config.withQueryLogging && {
			log: [
				{
					emit: 'stdout',
					level: 'query',
				},
			],
		}),
	});
}
