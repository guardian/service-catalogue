import { getPrismaClient } from 'common/database';
import { getConfig } from './config';
import { createDigestForAccount } from './digest';
import { getFsbpFindings, groupFindingsByAccount } from './findings';
import type { Digest, SecurityHubSeverity } from './types';

export async function main() {
	const config = await getConfig();
	const prisma = getPrismaClient(config);

	const severities: SecurityHubSeverity[] = ['CRITICAL', 'HIGH'];
	const findings = await getFsbpFindings(prisma, severities);
	const groupedFindings = groupFindingsByAccount(findings);

	const digests = Object.keys(groupedFindings)
		.map((awsAccountId) =>
			createDigestForAccount(awsAccountId, groupedFindings),
		)
		.filter(Boolean) as Digest[];

	for (const digest of digests) {
		console.log({ digest });
	}

	// TODO: Send an email out for each digest
}
