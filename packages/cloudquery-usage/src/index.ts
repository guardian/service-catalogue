import { getPrismaClient } from 'common/src/database-setup.js';
import { getPluginUsageSummary } from './cloudquery-api.js';
import { getConfig } from './config.js';
import { getDateRange } from './date.js';
import { saveResults } from './db-write.js';
import { usageSummaryToDatabaseRows } from './transform.js';

export async function main(...args: unknown[]) {
	console.debug(
		`Additional args: ${args.map((arg) => JSON.stringify(arg)).join(', ')}`,
	);

	const config = await getConfig();
	const prismaClient = getPrismaClient(config);

	const dateRange = getDateRange();
	const json = await getPluginUsageSummary(config, dateRange);
	const rowsToSave = usageSummaryToDatabaseRows(json);
	await saveResults(prismaClient, rowsToSave);
}
