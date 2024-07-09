import type { aws_securityhub_findings, PrismaClient } from '@prisma/client';
import type {
	Digest,
	Finding,
	GroupedFindings,
	SecurityHubSeverity,
} from './types';

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
		const recommendation = finding.remediation as {
			Recommendation: {
				Url: string | null;
			};
		} | null;
		if (recommendation) {
			if (
				'Url' in recommendation['Recommendation'] &&
				recommendation['Recommendation']['Url']
			) {
				remediationUrl = recommendation['Recommendation']['Url'];
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

function createEmailBody(findings: Finding[]): string {
	const findingsSortedByPriority = findings.sort(
		(a, b) => (b.priority ?? 0) - (a.priority ?? 0),
	);

	return `The following vulnerabilities have been found in your account\n: 
        ${findingsSortedByPriority
					.map(
						(f) =>
							`[${f.severity}] ${f.title}
Affected resource(s): ${f.resources.join(',')}
Remediation: ${f.remediationUrl ?? 'Unknown'}`,
					)
					.join('\n\n')}`;
}

export function createDigestForTeam(
	findings: Record<string, Finding[]>,
	awsAccountId: string,
): Digest | undefined {
	const teamFindings = findings[awsAccountId];

	if (!teamFindings || teamFindings.length == 0) {
		return undefined;
	}

	return {
		accountId: awsAccountId,
		subject: `Security Hub vulnerabilities detected in AWS account ${teamFindings[0]?.awsAccountName}`,
		message: createEmailBody(teamFindings),
	};
}

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

export async function getFsbpFindings(
	prisma: PrismaClient,
	severities: SecurityHubSeverity[],
): Promise<Finding[]> {
	const findings = await prisma.aws_securityhub_findings.findMany({
		where: {
			OR: severities.map((s) => ({
				severity: { path: ['Label'], equals: s },
			})),
		},
	});

	return findings.map(transformFinding);
}
