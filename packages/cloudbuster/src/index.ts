import { Anghammarad } from '@guardian/anghammarad';
import type { cloudbuster_fsbp_vulnerabilities } from 'common/generated/prisma/client.js';
import { logger } from 'common/logs.js';
import { getFsbpFindings } from 'common/src/database-queries.js';
import { getPrismaClient } from 'common/src/database-setup.js';
import type { SecurityHubSeverity } from 'common/src/types.js';
import { getConfig } from './config.js';
import { createDigestsFromFindings, sendDigest } from './digests.js';
import { findingsToGuardianFormat } from './findings.js';

export async function main() {
	const severities: SecurityHubSeverity[] = ['CRITICAL', 'HIGH'];

	// *** SETUP ***
	const config = await getConfig();
	const prisma = getPrismaClient(config);

	// *** DATA GATHERING ***
	logger.log({
		message: `Starting Cloudbuster. Level of severities that will be scanned: ${severities.join(', ')}`,
	});

	const dbResults = await getFsbpFindings(prisma, severities);

	const tableContents: cloudbuster_fsbp_vulnerabilities[] = dbResults.flatMap(
		findingsToGuardianFormat,
	);

	const controlIdArns = new Map<string, cloudbuster_fsbp_vulnerabilities>();
	const duplicateControlIdArns: string[] = [];
	tableContents.forEach((row) => {
		const compositeKey = `${row.control_id}:${row.arn}:${row.aws_region}`;
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

	const activeFindings = uniqueTableContents.filter((row) => !row.suppressed);

	const digests = createDigestsFromFindings(
		activeFindings,
		'CRITICAL',
		config.cutOffInDays,
	);

	const isTuesday = new Date().getDay() === 2;
	if (isTuesday) {
		digests.push(
			...createDigestsFromFindings(activeFindings, 'HIGH', config.cutOffInDays),
		);
	}
	// *** NOTIFICATION SENDING ***
	const anghammaradClient = new Anghammarad();

	await Promise.all(
		digests.map(
			async (digest) => await sendDigest(anghammaradClient, config, digest),
		),
	);
}
