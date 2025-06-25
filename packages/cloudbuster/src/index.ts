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

	const tableContents: cloudbuster_fsbp_vulnerabilities[] = dbResults.flatMap((res) =>
		findingsToGuardianFormat(res)
	);

	const controlIdArns = new Map<string, cloudbuster_fsbp_vulnerabilities>();
	const duplicateControlIdArns: string[] = [];
	tableContents.forEach((row) => {
		const compositeKey = `${row.control_id}:${row.arn}`;
		if (controlIdArns.has(compositeKey)) {
			if (!duplicateControlIdArns.includes(compositeKey)) {
				duplicateControlIdArns.push(compositeKey);
			}
		} else {
			controlIdArns.set(compositeKey, row);
		}
	});
	const uniqueTableContents = Array.from(controlIdArns.values());

	logger.log({
		message: `${tableContents.length} high and critical FSBP findings detected`,
	});

	if (tableContents.length !== uniqueTableContents.length) {
		logger.warn({
			message: `${tableContents.length - uniqueTableContents.length} duplicate FSBP findings detected with control IDs and resource ARNs: ${duplicateControlIdArns.join(', ')}`,
		});
	}

	await prisma.cloudbuster_fsbp_vulnerabilities.deleteMany();
	await prisma.cloudbuster_fsbp_vulnerabilities.createMany({
		data: uniqueTableContents,
	});

	const digests = createDigestsFromFindings(uniqueTableContents, 'CRITICAL');

	const isTuesday = new Date().getDay() === 2;
	if (isTuesday) {
		digests.push(...createDigestsFromFindings(uniqueTableContents, 'HIGH'));
	}
	// *** NOTIFICATION SENDING ***
	const anghammaradClient = new Anghammarad();

	await Promise.all(
		digests.map(
			async (digest) => await sendDigest(anghammaradClient, config, digest),
		),
	);
}
