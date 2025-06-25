import type { aws_securityhub_findings, PrismaClient } from '@prisma/client';
import type { SecurityHubFinding, SecurityHubSeverity } from './types';
/**
 * Queries the database for FSBP findings
 */

export async function getFsbpFindings(
	prisma: PrismaClient,
	severities: SecurityHubSeverity[],
): Promise<SecurityHubFinding[]> {
	const findings: aws_securityhub_findings[] =
		await prisma.aws_securityhub_findings.findMany({
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

	return findings as unknown as SecurityHubFinding[];
}
