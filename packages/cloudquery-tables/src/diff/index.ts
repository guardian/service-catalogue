import * as fs from 'node:fs';
import path from 'node:path';
import { pluginsToCheck } from './config';
import { getTables } from './parse';
import { createReport } from './report';
import type { Result } from './types';

if (require.main === module) {
	const result: Result[] = pluginsToCheck.map((item) => {
		const { name, version, cliResponseFilepath, currentTables } = item;

		const tables = getTables(cliResponseFilepath);
		const tableNames = tables.map((_) => _.name);

		return {
			name,
			version,
			tablesCollected: tables.filter((_) => currentTables.includes(_.name)),
			tablesRemoved: currentTables
				.filter((_) => !tableNames.includes(_))
				.map((name) => ({
					name,
					isIncremental: false,
				})),
			tablesAvailable: tables.filter((_) => !currentTables.includes(_.name)),
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
