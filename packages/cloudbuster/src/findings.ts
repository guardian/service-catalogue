import { isWithinSlaTime, stringToSeverity } from 'common/src/functions';
import type { SecurityHubFinding, Severity } from 'common/src/types';
import type { Finding, GroupedFindings } from './types';

/**
 * Transforms a SQL row into a finding
 */
export function transformFinding(finding: SecurityHubFinding): Finding {
	let severity: Severity = 'unknown';
	let priority = null;
	let remediationUrl = null;
	let resources = null;

	if (
		typeof finding.severity === 'object' &&
		'Label' in finding.severity &&
		'Normalized' in finding.severity
	) {
		severity = stringToSeverity(finding.severity['Label'] as string);
		priority = finding.severity['Normalized'];
	}

	if (typeof finding.remediation === 'object') {
		const remediation = finding.remediation as {
			Recommendation: {
				Url: string | null;
			};
		} | null;
		if (remediation) {
			if (
				'Url' in remediation['Recommendation'] &&
				remediation['Recommendation']['Url']
			) {
				remediationUrl = remediation['Recommendation']['Url'];
			}
		}
	}

	if (Array.isArray(finding.resources)) {
		resources = finding.resources
			.map((r) => {
				if (typeof r === 'object' && 'Id' in r) {
					return r['Id'];
				}
				return null;
			})
			.filter(Boolean);
	}

	return {
		awsAccountId: finding.aws_account_id,
		awsAccountName: finding.aws_account_name,
		title: finding.title,
		resources: resources as string[],
		severity,
		priority,
		remediationUrl,
		isWithinSla: isWithinSlaTime(finding.first_observed_at, severity),
	};
}

/**
 * @param findings An array of FSBP findings.
 * @returns An object mapping account numbers to findings.
 * E.g.
 * ```ts
 *  {
 *  accountNumber123: ["finding1", "finding2"],
 *  accountNumber345: ["finding4", "finding5", "finding6"]
 *  }
 * ```
 */
export function groupFindingsByAccount(findings: Finding[]): GroupedFindings {
	const findingsGroupedByAwsAccount: GroupedFindings = {};

	for (const finding of findings) {
		const { awsAccountId } = finding;
		if (!findingsGroupedByAwsAccount[awsAccountId]) {
			findingsGroupedByAwsAccount[awsAccountId] = [];
		}
		findingsGroupedByAwsAccount[awsAccountId].push(finding);
	}

	return findingsGroupedByAwsAccount;
}
