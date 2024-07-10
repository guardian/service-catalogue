import { getFsbpFindings } from 'common/src/database-queries';
import { getPrismaClient } from 'common/src/database-setup';
import { getConfig } from './config';
import { createDigestsFromFindings } from './digests';
import { transformFinding } from './findings';

export async function main() {
	const config = await getConfig();
	const prisma = getPrismaClient(config);

	const findings = (await getFsbpFindings(prisma, config.severities)).map((f) =>
		transformFinding(f),
	);
	const digests = createDigestsFromFindings(findings);

	for (const digest of digests) {
		// TODO: Send an email out for each digest
		console.log({ digest });
	}
}
