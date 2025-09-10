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
					//tagging standard uses 'LOW' and 'INFORMATIONAL'.
					// For security standards, we are only interested in 'HIGH' and 'CRITICAL'
					//It may seem unnecessary, but this cuts our row count in half.
					stringFilter(AwsComparison.NotEquals, 'MEDIUM'),
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
				finding_status: [stringFilter(AwsComparison.Equals, 'ACTIVE')],
				severity: [
					stringFilter(AwsComparison.Equals, 'CRITICAL'),
					stringFilter(AwsComparison.Equals, 'HIGH'),
				],
			},
		},
	],
};
