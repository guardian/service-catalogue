import { getPrismaClient } from 'common/src/database-setup.js';
import { getConfig } from './config.js';
import { getWorkflows } from './db-read.js';
import { saveResults } from './db-write.js';
import { extractGithubUsesStrings } from './transform.js';

export async function main(...args: unknown[]) {
	console.log(
		`Called with ${args.map((arg) => JSON.stringify(arg)).join(', ')}`,
	);

	const config = await getConfig();
	const prismaClient = getPrismaClient(config);

	const now = new Date();
	const workflowsFromDatabase = await getWorkflows(prismaClient);
	const recordsToSave = await extractGithubUsesStrings(workflowsFromDatabase);

	/*
	Prisma performs `deleteMany` and `createMany` in separate transactions by default.
	Here we manually wrap them in a single transaction to ensure that the delete and create operations are atomic.
	 */
	await prismaClient.$transaction([
		prismaClient.guardian_github_actions_usage.deleteMany(),
		saveResults(prismaClient, recordsToSave, now),
	]);
}
