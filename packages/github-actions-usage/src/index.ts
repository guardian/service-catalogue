import { getPrismaClient } from 'common/database';
import { getConfig } from './config';
import { getWorkflows } from './db-read';
import { saveResults } from './db-write';
import { transform } from './transform';

export async function main(...args: unknown[]) {
	console.log(
		`Called with ${args.map((arg) => JSON.stringify(arg)).join(', ')}`,
	);

	const config = await getConfig();
	const prismaClient = getPrismaClient(config);

	const now = new Date();
	const data = await getWorkflows(prismaClient);
	const recordsToSave = await transform(data);

	/*
	Prisma performs `deleteMany` and `createMany` in separate transactions by default.
	Here we manually wrap them in a single transaction to ensure that the delete and create operations are atomic.
	 */
	await prismaClient.$transaction([
		prismaClient.guardian_github_actions_usage.deleteMany(),
		saveResults(prismaClient, recordsToSave, now),
	]);
}
