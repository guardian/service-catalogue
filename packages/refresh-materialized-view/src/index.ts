import { getPrismaClient } from 'common/database';
import { getConfig } from './config';

export async function main(...args: unknown[]) {
	console.debug(
		`Called with ${args.map((arg) => JSON.stringify(arg)).join(', ')}`,
	);

	const config = await getConfig();
	const prismaClient = getPrismaClient(config);

	await prismaClient.$executeRaw`REFRESH MATERIALIZED VIEW aws_resources;`;
	console.log(`Materialized view 'aws_resources' has been refreshed`);
}
