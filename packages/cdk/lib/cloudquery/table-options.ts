enum AwsComparison {
	//https://docs.aws.amazon.com/securityhub/1.0/APIReference/API_StringFilter.html
	Equals = 'EQUALS',
	Prefix = 'PREFIX',
	NotEquals = 'NOT_EQUALS',
	PrefixNotEquals = 'PREFIX_NOT_EQUALS',
	Contains = 'CONTAINS',
	NotContains = 'NOT_CONTAINS',
	ContainsWord = 'CONTAINS_WORD',
}

interface AwsStringFilter {
	comparison: AwsComparison;
	value: string;
}

function stringFilter(
	comparison: AwsComparison,
	value: string,
): AwsStringFilter {
	return {
		comparison: comparison,
		value: value,
	};
}

interface AwsDateFilter {
	start_inclusive: string;
	end_inclusive?: string;
}

function dateFilter(
	start_inclusive: string,
	end_inclusive: string | undefined = undefined,
): AwsDateFilter {
	// leaving out the end date makes it retrieve everything since the start date - but the
	// parameter has to be absent rather than simply empty.
	const filter: AwsDateFilter = {
		start_inclusive: start_inclusive,
	};
	if (end_inclusive !== undefined) {
		filter.end_inclusive = end_inclusive;
	}
	return filter;
}

// https://docs.aws.amazon.com/securityhub/1.0/APIReference/API_AwsSecurityFindingFilters.html
export const securityHubTableOptions = {
	get_findings: [
		{
			filters: {
				record_state: [stringFilter(AwsComparison.Equals, 'ACTIVE')],
				compliance_status: [stringFilter(AwsComparison.NotEquals, 'PASSED')],
				product_name: [
					stringFilter(AwsComparison.Equals, 'GuardDuty'),
					stringFilter(AwsComparison.Equals, 'Inspector'),
					stringFilter(AwsComparison.Equals, 'Security Hub'),
				],
				severity_label: [
					stringFilter(AwsComparison.Equals, 'CRITICAL'),
					stringFilter(AwsComparison.Equals, 'HIGH'),
				],
			},
		},
	],
};

// https://docs.aws.amazon.com/inspector/v2/APIReference/API_FilterCriteria.html
export const inspector2TableOptions = {
	list_findings: [
		{
			filter_criteria: {
				//finding_status: [stringFilter(AwsComparison.Equals, 'ACTIVE')],
				severity: [
					stringFilter(AwsComparison.Equals, 'CRITICAL'),
					stringFilter(AwsComparison.Equals, 'HIGH'),
				],
				updated_at: [
					// just the start date
					dateFilter('2026-08-24T00:00:00Z'), //, '2026-09-05T00:00:00Z'),
				],
			},
		},
	],
};
