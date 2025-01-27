import { getPrismaClient } from 'common/src/database-setup';
import { getPluginUsageSummary } from './cloudquery-api';
import { getConfig } from './config';
import { getDateRange } from './date';
import { saveResults } from './db-write';
import { usageSummaryToDatabaseRows } from './transform';

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
