import { getPrismaClient } from 'common/database';
import { getConfig } from './config';
import { createDigestsFromFindings } from './digests';
import { getFsbpFindings } from './findings';

export async function main() {
	const config = await getConfig();
	const prisma = getPrismaClient(config);

	const findings = await getFsbpFindings(prisma, config.severities);
	const digests = createDigestsFromFindings(findings);

	for (const digest of digests) {
		console.log({ digest });
	}

	// TODO: Send an email out for each digest
}
