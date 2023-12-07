interface CentralElkProps {
	/**
	 * Fields to filter the logs by.
	 */
	filters: Record<string, string>;

	/**
	 * Which columns to display in the Kibana table.
	 */
	columns?: string[];
}

/**
 * Builds a deep link to the logs within Central ELK.
 */
export function getCentralElkLink(props: CentralElkProps): string {
	const { filters, columns } = props;

	const kibanaFilters = Object.entries(filters).map(([key, value]) => {
		return `(query:(match_phrase:(${key}:'${value}')))`;
	});

	// The `#/` at the end is important for Kibana to correctly parse the query string
	// The `URL` object moves this to the end of the string, which breaks the link.
	const base = 'https://logs.gutools.co.uk/s/devx/app/discover#/';

	const query = {
		_g: `(filters:!(${kibanaFilters.join(',')}))`,
		...(columns && {
			_a: `(columns:!(${columns.join(',')}))`,
		}),
	};

	const queryString = Object.entries(query)
		.map(([key, value]) => `${key}=${value}`)
		.join('&');

	return `${base}?${queryString}`;
}
