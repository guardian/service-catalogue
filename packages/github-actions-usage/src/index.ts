import { getPrismaClient } from 'common/database';
import { getConfig } from './config';
import { getWorkflows } from './db-read';
import { saveResults } from './db-write';
import { transform } from './transform';

export async function main() {
	const config = await getConfig();
	const prismaClient = getPrismaClient(config);

	const now = new Date();
	const data = await getWorkflows(prismaClient);
	const recordsToSave = transform(data);
	await prismaClient.guardian_github_actions_usage.deleteMany();
	await saveResults(prismaClient, recordsToSave, now);
}
