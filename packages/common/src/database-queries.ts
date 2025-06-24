import type { aws_securityhub_findings, PrismaClient } from '@prisma/client';
import { toNonEmptyArray } from './functions';
import type { AwsCloudFormationStack, NonEmptyArray, SecurityHubFinding, SecurityHubSeverity } from './types';
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

export async function getStacks(
	client: PrismaClient,
): Promise<NonEmptyArray<AwsCloudFormationStack>> {
	const stacks = (
		await client.aws_cloudformation_stacks.findMany({
			select: {
				stack_name: true,
				account_id: true,
				region: true,
				tags: true,
				creation_time: true,
				last_updated_time: true,
			},
		})
	).map((stack) => stack as AwsCloudFormationStack);

	console.debug(`Found ${stacks.length} stacks.`);
	return toNonEmptyArray(stacks);
}
