import * as fs from 'node:fs';
import path from 'node:path';
import { isCloudQueryTable } from 'cloudquery-tables';
import { pluginsToCheck } from './config';
import { getTableNames } from './parse';
import { createReport } from './report';
import type { Result } from './types';

if (require.main === module) {
	const result: Result[] = pluginsToCheck.map((item) => {
		const { name, version, cliResponseFilepath, currentTables } = item;

		const tableNames = getTableNames(cliResponseFilepath);

		return {
			name,
			version,
			tablesCollected: currentTables.filter((_) => tableNames.includes(_)),
			tablesRemoved: currentTables.filter((_) => !tableNames.includes(_)),
			tablesAvailable: tableNames.filter((_) => !isCloudQueryTable(_)),
		};
	});

	const report = createReport(result);

	const reportFilepath = path.join(__dirname, '../../cq-docs/REPORT.md');
	fs.writeFileSync(reportFilepath, report, {
		encoding: 'utf-8',
	});

	console.log(`Report written to ${reportFilepath}`);

	const removed = result.flatMap((_) => _.tablesRemoved);

	if (removed.length > 0) {
		console.log(`${removed.length} tables were removed.`);
		process.exit(1);
	}
}
