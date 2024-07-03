import type { aws_securityhub_findings, PrismaClient } from '@prisma/client';
import type { Finding, SecurityHubSeverity } from './types';

function isWithinSlaTime(finding: aws_securityhub_findings): boolean {
	if (!finding.first_observed_at) {
		return false;
	}

	const today = new Date();
	const timeDifference = today.getTime() - finding.first_observed_at.getTime();
	const dayDifference = timeDifference / (1000 * 60 * 60 * 24);
	const isWithinTwoDays = Math.abs(dayDifference) <= 2;
	const isWithinThirtyDays = Math.abs(dayDifference) <= 30;

	const severity = (finding.severity as { Label: SecurityHubSeverity })[
		'Label'
	];

	return (
		(severity === 'CRITICAL' && isWithinTwoDays) ||
		(severity === 'HIGH' && isWithinThirtyDays)
	);
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
	const fspb = findings.map((f) => {
		const severity = f.severity as { Label: SecurityHubSeverity };

		return {
			accountName: f.aws_account_name,
			title: f.title,
			severity: severity['Label'],
			withinSlaTime: isWithinSlaTime(f),
		} as Finding;
	});

	console.log(fspb);
	return fspb;
}
