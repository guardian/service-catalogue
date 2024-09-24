import { Anghammarad } from '@guardian/anghammarad';
import { getFsbpFindings } from 'common/src/database-queries';
import { getPrismaClient } from 'common/src/database-setup';
import type { SecurityHubSeverity } from 'common/src/types';
import { getConfig } from './config';
import { createDigestsFromFindings, sendDigest } from './digests';
import { findingsToGuardianFormat, transformFinding } from './findings';

type LambdaHandlerProps = {
	severities?: SecurityHubSeverity[];
};

export async function main(input: LambdaHandlerProps) {
	// When manually invoking the function in AWS for testing,
	// it can be cumbersome to manually type this object as an input.
	// Therefore, fall back to default values.
	const { severities = ['CRITICAL', 'HIGH'] } = input;

	// *** SETUP ***
	const config = await getConfig();
	const prisma = getPrismaClient(config);

	// *** DATA GATHERING ***
	console.log(
		`Starting Cloudbuster. Level of severities that will be scanned: ${severities.join(', ')}`,
	);

	const dbResults = (await getFsbpFindings(prisma, severities)).slice(0, 5); //TODO: remove slice when ready to go live

	const findings = dbResults.map((f) => transformFinding(f));

	const tableContents = dbResults.flatMap(findingsToGuardianFormat);

	console.table(tableContents);

	await prisma.cloudbuster_fsbp_vulnerabilities.deleteMany();
	await prisma.cloudbuster_fsbp_vulnerabilities.createMany({
		data: tableContents,
	});

	const digests = createDigestsFromFindings(findings);

	// *** NOTIFICATION SENDING ***
	const anghammaradClient = new Anghammarad();

	await Promise.all(
		digests.map(
			async (digest) => await sendDigest(anghammaradClient, config, digest),
		),
	);
}
