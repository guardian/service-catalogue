import type { cloudquery_plugin_usage } from '@prisma/client';
import type { UsageSummaryResponseForPaidRows } from './types.js';

export function usageSummaryToDatabaseRows(
	response: UsageSummaryResponseForPaidRows,
): cloudquery_plugin_usage[] {
	const rows: cloudquery_plugin_usage[] = [];

	response.metadata.metrics.forEach((metric) => {
		response.groups.forEach((group, groupIndex) => {
			const { value: name } = group;

			response.values.forEach((value) => {
				const { timestamp } = value;
				const metricValue = value[metric][groupIndex] ?? 0;

				const row: cloudquery_plugin_usage = {
					timestamp: new Date(timestamp),
					name,
					metric,
					value: metricValue,
				};

				rows.push(row);
			});
		});
	});

	return rows;
}
