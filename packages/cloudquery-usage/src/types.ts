interface UsageSummaryGroup {
	/**
	 * The CloudQuery component.
	 *
	 * @example 'plugin'
	 */
	name: string;

	/**
	 * The CloudQuery component name.
	 *
	 * @example	'cloudquery/source/aws'
	 */
	value: string;
}

interface UsageSummaryMetadata<Metric extends string> {
	/**
	 * The start window of the metrics in ISO 8601 format.
	 */
	start: string;

	/**
	 * The end window of the metrics in ISO 8601 format.
	 */
	end: string;

	/**
	 * The aggregation period of the metrics.
	 *
	 * @example 'day'
	 */
	aggregation_period: string;

	/**
	 * The type of metrics.
	 *
	 * @example ['paid_rows']
	 */
	metrics: [Metric];
}

type UsageSummaryValue<Metric extends string> = Record<Metric, number[]> & {
	/**
	 * The date for the metric in ISO 8601 format.
	 */
	timestamp: string;
};

/**
 * @see https://api-docs.cloudquery.io/#tag/teams/operation/GetGroupedTeamUsageSummary
 */
interface UsageSummaryResponse<Metric extends string> {
	groups: UsageSummaryGroup[];
	metadata: UsageSummaryMetadata<Metric>;
	values: Array<UsageSummaryValue<Metric>>;
}

export type UsageSummaryResponseForPaidRows = UsageSummaryResponse<'paid_rows'>;

export interface DateRange {
	/**
	 * The inclusive start of the query time range.
	 */
	start: Date;

	/**
	 * The exclusive end of the query time range.
	 */
	end: Date;
}
