import type { Config } from './config.js';
import type { DateRange, UsageSummaryResponseForPaidRows } from './types.js';

/**
 * Return the CloudQuery plugin usage, by day.
 *
 * @see https://api-docs.cloudquery.io/#tag/teams/operation/GetGroupedTeamUsageSummary
 */
export async function getPluginUsageSummary(
	config: Config,
	dateRange: DateRange,
): Promise<UsageSummaryResponseForPaidRows> {
	const { cloudqueryTeam, cloudqueryApiKey } = config;
	const { start, end } = dateRange;

	const url = new URL(
		`https://api.cloudquery.io/teams/${cloudqueryTeam}/usage-summary/plugin`,
	);

	url.searchParams.set('metrics', 'paid_rows');
	url.searchParams.set('aggregation_period', 'day');

	url.searchParams.set('start', start.toISOString());
	url.searchParams.set('end', end.toISOString());

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${cloudqueryApiKey}`,
		},
	});

	if (response.status !== 200) {
		throw new Error(
			`Received status code ${response.status} from ${url.toString()}`,
		);
	}

	// TODO validate with zod, or similar
	return (await response.json()) as UsageSummaryResponseForPaidRows;
}
