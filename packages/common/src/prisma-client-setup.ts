import { PrismaPg } from '@prisma/adapter-pg';
import type { PrismaConfig } from 'common/src/database-setup.js';
import { PrismaClient } from 'common/src/prisma-client/client.js';

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
