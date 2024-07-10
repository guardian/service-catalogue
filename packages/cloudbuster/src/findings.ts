import type { aws_securityhub_findings, PrismaClient } from '@prisma/client';
import type { Finding, GroupedFindings, SecurityHubSeverity } from './types';

/**
 * Queries the database for FSBP findings
 */
export async function getFsbpFindings(
	prisma: PrismaClient,
	severities: SecurityHubSeverity[],
): Promise<Finding[]> {
	const findings = await prisma.aws_securityhub_findings.findMany({
		where: {
			OR: severities.map((s) => ({
				severity: { path: ['Label'], equals: s },
			})),
			AND: {
				generator_id: {
					startsWith: 'aws-foundational-security-best-practices/v/1.0.0',
				},
			},
		},
	});

	return findings.map(transformFinding);
}

/**
 * Transforms a SQL row into a finding
 */
function transformFinding(finding: aws_securityhub_findings): Finding {
	let severity = null;
	let priority = null;
	let remediationUrl = null;
	let resources = null;

	if (
		finding.severity &&
		typeof finding.severity === 'object' &&
		'Label' in finding.severity &&
		'Normalized' in finding.severity
	) {
		severity = finding.severity['Label'] as SecurityHubSeverity;
		priority = finding.severity['Normalized'] as number;
	}

	if (finding.remediation && typeof finding.remediation === 'object') {
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

	if (finding.resources && Array.isArray(finding.resources)) {
		resources = finding.resources
			.map((r) => {
				if (r && typeof r === 'object' && 'Id' in r) {
					return r['Id'] as string;
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
 * Determines whether a Security Hub finding is within the SLA window
 */
export function isWithinSlaTime(
	firstObservedAt: Date | null,
	severity: SecurityHubSeverity | null,
): boolean {
	if (!firstObservedAt || !severity) {
		return false;
	}

	const today = new Date();
	const timeDifference = today.getTime() - firstObservedAt.getTime();
	const dayDifference = timeDifference / (1000 * 60 * 60 * 24);

	const isWithinTwoDays = Math.abs(dayDifference) <= 2;
	const isWithinThirtyDays = Math.abs(dayDifference) <= 30;

	return (
		(severity === 'CRITICAL' && isWithinTwoDays) ||
		(severity === 'HIGH' && isWithinThirtyDays)
	);
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
		findingsGroupedByAwsAccount[awsAccountId]?.push(finding);
	}

	return findingsGroupedByAwsAccount;
}
