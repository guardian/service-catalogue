import type { aws_securityhub_findings, PrismaClient } from '@prisma/client';
import type { FsbpDigest, SecurityHubSeverity } from './types';

/**
 * Determines whether a Security Hub finding is within the SLA window
 */
function isWithinSlaTime(finding: aws_securityhub_findings): boolean {
	if (!finding.first_observed_at) {
		return false;
	}

	const today = new Date();
	const timeDifference = today.getTime() - finding.first_observed_at.getTime();
	const dayDifference = timeDifference / (1000 * 60 * 60 * 24);

	const isWithinTwoDays = Math.abs(dayDifference) <= 2;
	const isWithinThirtyDays = Math.abs(dayDifference) <= 30;

	let severity;
	if (
		finding.severity &&
		typeof finding.severity === 'object' &&
		'Label' in finding.severity
	) {
		severity = finding.severity['Label'];
	}

	return (
		(severity === 'CRITICAL' && isWithinTwoDays) ||
		(severity === 'HIGH' && isWithinThirtyDays)
	);
}

/**
 * Transforms a SQL row into a vulnerability digest
 */
function fsbpDigestFromFinding(finding: aws_securityhub_findings): FsbpDigest {
	let severity = null;
	let remediationUrl = null;

	if (
		finding.severity &&
		typeof finding.severity === 'object' &&
		'Label' in finding.severity
	) {
		severity = finding.severity['Label'] as SecurityHubSeverity;
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

	return {
		awsAccountName: finding.aws_account_name,
		title: finding.title,
		severity,
		remediationUrl: remediationUrl,
		firstObservedAt: finding.first_observed_at,
		isWithinSla: isWithinSlaTime(finding),
	};
}

export async function getFsbpFindings(
	prisma: PrismaClient,
	severities: SecurityHubSeverity[],
): Promise<FsbpDigest[]> {
	const findings = await prisma.aws_securityhub_findings.findMany({
		where: {
			OR: severities.map((s) => ({
				severity: { path: ['Label'], equals: s },
			})),
		},
	});

	const digests = findings.map(fsbpDigestFromFinding);

	console.log(digests);
	return digests;
}
