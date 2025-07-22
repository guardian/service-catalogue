import type { cloudbuster_fsbp_vulnerabilities } from '@prisma/client';
import { isWithinSlaTime, stringToSeverity } from 'common/src/functions.js';
import type { SecurityHubFinding } from 'common/src/types.js';
import type { GroupedFindings } from './types.js';

export function findingsToGuardianFormat(
	finding: SecurityHubFinding,
): cloudbuster_fsbp_vulnerabilities[] {
	return finding.resources.map((r) => {
		return {
			severity: finding.severity.Label,
			control_id: finding.product_fields.ControlId,
			title: finding.title,
			aws_region: r.Region,
			repo: r.Tags?.['gu:repo'] ?? null,
			stack: r.Tags?.['Stack'] ?? null,
			stage: r.Tags?.Stage ?? null,
			app: r.Tags?.App ?? null,
			first_observed_at: finding.first_observed_at,
			arn: r.Id, // even though we're mapping, I've never observed an FSBP finding with multiple resources,so this will pretty much always be a single-element array
			aws_account_name: finding.aws_account_name,
			aws_account_id: finding.aws_account_id,
			within_sla: isWithinSlaTime(
				finding.first_observed_at,
				stringToSeverity(finding.severity.Label),
			),
			remediation: finding.remediation.Recommendation.Url,
			suppressed: finding.workflow.Status === 'SUPPRESSED',
		};
	});
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
export function groupFindingsByAccount(
	findings: cloudbuster_fsbp_vulnerabilities[],
): GroupedFindings {
	const findingsGroupedByAwsAccount: GroupedFindings = {};

	for (const finding of findings) {
		const { aws_account_id } = finding;
		if (aws_account_id) {
			// The account id should always exist, but the type system disagrees
			if (!findingsGroupedByAwsAccount[aws_account_id]) {
				findingsGroupedByAwsAccount[aws_account_id] = [];
			}
			findingsGroupedByAwsAccount[aws_account_id].push(finding);
		}
	}

	return findingsGroupedByAwsAccount;
}
