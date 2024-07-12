import { Anghammarad } from '@guardian/anghammarad';
import { getPrismaClient } from 'common/database';
import { getConfig } from './config';
import { createDigestsFromFindings, sendDigest } from './digests';
import { getFsbpFindings } from './findings';
import type { SecurityHubSeverity } from './types';

type LambdaHandlerProps = {
	severities?: SecurityHubSeverity[];
	subjectPrefix?: string;
};

export async function main(input: LambdaHandlerProps) {
	// When manually invoking the function in AWS for testing,
	// it can be cumbersome to manually type this object as an input.
	// Therefore, fall back to default values
	const {
		severities = ['CRITICAL', 'HIGH'],
		subjectPrefix = 'Security Hub Digest (high and critical findings)',
	} = input;

	console.log(
		`Starting Cloudbuster. Level of severities that will be scanned: ${severities.join('')}`,
	);

	const config = await getConfig();
	const { anghammaradSnsTopic, stage } = config;
	const prisma = getPrismaClient(config);
	const anghammarad = new Anghammarad();

	const findings = await getFsbpFindings(prisma, severities);
	const digests = createDigestsFromFindings(findings, subjectPrefix);

	if (stage === 'PROD' || stage === 'CODE') {
		if (!anghammaradSnsTopic) {
			throw new Error(
				'ANGHAMMARAD_SNS_ARN environment variable not found. Cannot send digests.',
			);
		}
		await Promise.all(
			digests.map(
				async (digest) => await sendDigest(anghammarad, config, digest),
			),
		);
	} else {
		for (const digest of digests) {
			console.log({ digest });
		}
	}
}
