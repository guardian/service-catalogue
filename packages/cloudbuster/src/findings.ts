import type { cloudbuster_fsbp_vulnerabilities } from '@prisma/client';
import { isWithinSlaTime, stringToSeverity } from 'common/src/functions';
import type { AwsTags, SecurityHubFinding } from 'common/src/types';
import type { GroupedFindings, StackUpdateTimes } from './types';

function findingDate(firstObservedAt: Date | null, tags: AwsTags, stackUpdateTimes: StackUpdateTimes, controlId: string): Date | null {
	const hasCorrectTags = !!tags.Stack && !!tags.Stage && !!tags.App;
	if (hasCorrectTags) {
		const key = `${tags.Stack}-${tags.Stage}-${tags.App}`;
		const stackUpdateTime = stackUpdateTimes.get(key);
		if (!stackUpdateTime && !firstObservedAt) {
			return null;
		}
		else if (!stackUpdateTime) {
			return firstObservedAt;
		}
		else if (!firstObservedAt) {

			return stackUpdateTime;
		}
		const minDate = new Date(Math.min(stackUpdateTime.getTime(), firstObservedAt.getTime()));
		if (minDate.getTime() === stackUpdateTime.getTime()) {
			console.debug(`Using stack update time ${stackUpdateTime.toDateString()}, instead of securityhub observation time ${firstObservedAt.toDateString()} for finding with control ID ${controlId}, and tags:`, tags.Stack, tags.Stage, tags.App);
		}


		return minDate;
	}
	return firstObservedAt;
}

export function findingsToGuardianFormat(
	finding: SecurityHubFinding,
	stackUpdateTimes: StackUpdateTimes,
): cloudbuster_fsbp_vulnerabilities[] {
	return finding.resources.map((r) => {

		const dateNeedsAdjusting = ['EC2.9', 'EC2.8'].includes(finding.product_fields.ControlId);

		const first_observed_at = dateNeedsAdjusting ? findingDate(
			finding.first_observed_at,
			r.Tags ?? {},
			stackUpdateTimes,
			finding.product_fields.ControlId,
		) : finding.first_observed_at;

		return {
			severity: finding.severity.Label,
			control_id: finding.product_fields.ControlId,
			title: finding.title,
			aws_region: r.Region,
			repo: r.Tags?.['gu:repo'] ?? null,
			stack: r.Tags?.['Stack'] ?? null,
			stage: r.Tags?.Stage ?? null,
			app: r.Tags?.App ?? null,
			first_observed_at,
			arn: r.Id, // even though we're mapping, I've never observed an FSBP finding with multiple resources,so this will pretty much always be a single-element array
			aws_account_name: finding.aws_account_name,
			aws_account_id: finding.aws_account_id,
			within_sla: isWithinSlaTime(
				first_observed_at,
				stringToSeverity(finding.severity.Label),
			),
			remediation: finding.remediation.Recommendation.Url,
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
