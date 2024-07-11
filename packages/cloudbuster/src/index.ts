import { Anghammarad } from '@guardian/anghammarad';
import { getPrismaClient } from 'common/database';
import { getConfig } from './config';
import { createDigestsFromFindings, sendDigest } from './digests';
import { getFsbpFindings } from './findings';
import type { SecurityHubSeverity } from './types';

export async function main(input: { severities: SecurityHubSeverity[] }) {
	console.log(
		`Starting Cloudbuster. Level of severities that will be scanned: ${input.severities.join(',')}`,
	);

	const config = await getConfig();
	const { anghammaradSnsTopic, stage } = config;
	const prisma = getPrismaClient(config);
	const anghammarad = new Anghammarad();

	const findings = await getFsbpFindings(prisma, input.severities);
	const digests = createDigestsFromFindings(findings);

	if (stage === 'PROD' || stage === 'CODE') {
		if (!anghammaradSnsTopic) {
			throw new Error(
				'ANGHAMMARAD_SNS_ARN environment variable not found. Cannot send digests.',
			);
		}
		await Promise.all(
			digests.map(
				async (digest) =>
					await sendDigest(anghammarad, config, digest, findings.length),
			),
		);
	} else {
		for (const digest of digests) {
			console.log({ digest });
		}
	}
}
