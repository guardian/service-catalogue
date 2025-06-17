enum AwsComparison { //https://docs.aws.amazon.com/securityhub/1.0/APIReference/API_StringFilter.html
    EQUALS = 'EQUALS',
    PREFIX = 'PREFIX',
    NOT_EQUALS = 'NOT_EQUALS',
    PREFIX_NOT_EQUALS = 'PREFIX_NOT_EQUALS',
    CONTAINS = 'CONTAINS',
    NOT_CONTAINS = 'NOT_CONTAINS',
    CONTAINS_WORD = 'CONTAINS_WORD',
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

export const securityHubTableOptions = {
    get_findings: [
        {
            filters: {
                record_state: [stringFilter(AwsComparison.EQUALS, 'ACTIVE')],
                compliance_status: [stringFilter(AwsComparison.NOT_EQUALS, 'PASSED')],
                product_name: [
                    stringFilter(AwsComparison.EQUALS, 'GuardDuty'),
                    stringFilter(AwsComparison.EQUALS, 'Inspector'),
                    stringFilter(AwsComparison.EQUALS, 'Security Hub'),
                ],
                severity_label: [
                    //tagging standard uses 'LOW' and 'INFORMATIONAL'.
                    // For security standards, we are only interested in 'HIGH' and 'CRITICAL'
                    //It may seem unnecessary, but this cuts our row count in half.
                    stringFilter(AwsComparison.NOT_EQUALS, 'MEDIUM'),

                ],
            },
        },
    ],
}

export const inspector2TableOptions = {
    aws_inspector2_findings: {
        list_findings: [
            {
                filter_criteria: {
                    finding_status: [stringFilter(AwsComparison.EQUALS, 'ACTIVE')],
                    severity: [
                        stringFilter(AwsComparison.EQUALS, 'CRITICAL'),
                        stringFilter(AwsComparison.EQUALS, 'HIGH'),
                    ],
                },
            },
        ],
    },
}