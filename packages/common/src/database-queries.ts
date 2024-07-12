import type { aws_securityhub_findings, PrismaClient } from '@prisma/client';
import type { Severity } from './types';
/**
 * Queries the database for FSBP findings
 */
export async function getFsbpFindings(
	prisma: PrismaClient,
	severities: Severity[],
): Promise<aws_securityhub_findings[]> {
	const findings = await prisma.aws_securityhub_findings.findMany({
		where: {
			OR: severities.map((s) => ({
				severity: { path: ['Label'], equals: s.toUpperCase() },
			})),
			AND: {
				generator_id: {
					startsWith: 'aws-foundational-security-best-practices/v/1.0.0',
				},
			},
		},
	});

	return findings;
}
