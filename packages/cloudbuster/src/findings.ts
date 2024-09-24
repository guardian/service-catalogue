import type { cloudbuster_fsbp_vulnerabilities } from '@prisma/client';
import { isWithinSlaTime, stringToSeverity } from 'common/src/functions';
import type { SecurityHubFinding, Severity } from 'common/src/types';
import type { Finding, GroupedFindings } from './types';

export function findingsToGuardianFormat(
	finding: SecurityHubFinding,
): cloudbuster_fsbp_vulnerabilities[] {
	const transformedFindings: cloudbuster_fsbp_vulnerabilities[] =
		finding.resources.map((r) => {
			const guFinding: cloudbuster_fsbp_vulnerabilities = {
				severity: finding.severity.Label,
				control_id: finding.product_fields.ControlId,
				title: finding.title,
				aws_region: r.Region,
				repo: r.Tags?.['gu:repo'] ?? null,
				stack: r.Tags?.['Stack'] ?? null,
				stage: r.Tags?.Stage ?? null,
				app: r.Tags?.App ?? null,
				first_observed_at: finding.first_observed_at,
				arn: r.Id,
				aws_account_name: finding.aws_account_name,
				aws_account_id: finding.aws_account_id,
				within_sla: isWithinSlaTime(
					finding.first_observed_at,
					stringToSeverity(finding.severity.Label),
				),
				remediation: finding.remediation.Recommendation.Url,
			};
			return guFinding;
		});
	return transformedFindings;
}

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
