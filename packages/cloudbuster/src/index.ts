import { getPrismaClient } from 'common/database';
import { getConfig } from './config';
import { getFsbpFindings } from './findings';
import type { SecurityHubSeverity } from './types';

export async function main() {
	const config = await getConfig();
	const prisma = getPrismaClient(config);

	const severities: SecurityHubSeverity[] = ['CRITICAL', 'HIGH'];
	await getFsbpFindings(prisma, severities);
}
