import { Anghammarad } from '@guardian/anghammarad';
import type { cloudbuster_fsbp_vulnerabilities } from '@prisma/client';
import { logger } from 'common/logs';
import { getFsbpFindings } from 'common/src/database-queries';
import { getPrismaClient } from 'common/src/database-setup';
import type { SecurityHubSeverity } from 'common/src/types';
import { getConfig } from './config';
import { createDigestsFromFindings, sendDigest } from './digests';
import { findingsToGuardianFormat } from './findings';

export async function main() {
	const severities: SecurityHubSeverity[] = ['CRITICAL', 'HIGH'];

	// *** SETUP ***
	const config = await getConfig();
	const prisma = getPrismaClient(config);

	// *** DATA GATHERING ***
	logger.log({
		message: `Starting Cloudbuster. Level of severities that will be scanned: ${severities.join(', ')}`,
	});

	const dbResults = (await getFsbpFindings(prisma, severities)).filter(
		(f) => f.workflow.Status !== 'SUPPRESSED',
	);

	const tableContents: cloudbuster_fsbp_vulnerabilities[] = dbResults.flatMap(
		findingsToGuardianFormat,
	);

	logger.log({
		message: `${tableContents.length} high and critical FSBP findings detected`,
	});

	await prisma.cloudbuster_fsbp_vulnerabilities.deleteMany();
	await prisma.cloudbuster_fsbp_vulnerabilities.createMany({
		data: tableContents,
	});

	const digests = createDigestsFromFindings(tableContents, 'CRITICAL');

	const isTuesday = new Date().getDay() === 2;
	if (isTuesday) {
		digests.push(...createDigestsFromFindings(tableContents, 'HIGH'));
	}
	// *** NOTIFICATION SENDING ***
	const anghammaradClient = new Anghammarad();

	await Promise.all(
		digests.map(
			async (digest) => await sendDigest(anghammaradClient, config, digest),
		),
	);
}
