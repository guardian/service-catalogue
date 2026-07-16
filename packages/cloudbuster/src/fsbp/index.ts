import type { Anghammarad } from '@guardian/anghammarad';
import { getFsbpFindings } from 'common/database-queries.js';
import { logger } from 'common/logs.js';
import type {
	cloudbuster_fsbp_vulnerabilities,
	PrismaClient,
} from 'common/prisma-client/client.js';
import type { SecurityHubSeverity } from 'common/types.js';
import type { Config } from '../config.js';
import { createDigestsFromFindings, sendDigest } from './digests.js';
import { findingsToGuardianFormat } from './findings.js';

export async function createFsbpTableAndAlerts(
	config: Config,
	prisma: PrismaClient,
	anghammaradClient: Anghammarad,
) {
	const severities: SecurityHubSeverity[] = ['CRITICAL', 'HIGH'];

	// *** DATA GATHERING ***
	logger.log({
		message: `Level of severities that will be scanned: ${severities.join(', ')}`,
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
			message: `${tableContents.length - uniqueTableContents.length} duplicate FSBP findings detected with control IDs and resource ARNs, including: ${duplicateControlIdArns.slice(0, 10).join(', ')}`,
		});
	}

	await prisma.cloudbuster_fsbp_vulnerabilities.deleteMany();
	await prisma.cloudbuster_fsbp_vulnerabilities.createMany({
		data: uniqueTableContents,
	});

	const activeFindings: cloudbuster_fsbp_vulnerabilities[] =
		uniqueTableContents.filter((row) => !row.suppressed);

	logger.log({ message: `${activeFindings.length} active FSBP findings.` });

	logger.log({
		message: `Creating digests for 'CRITICAL' severity findings.`,
	});

	const digests = createDigestsFromFindings(
		activeFindings,
		'CRITICAL',
		config.cutOffInDays,
	);

	const isTuesday = new Date().getDay() === 2;
	if (isTuesday) {
		logger.log({ message: "Creating digests for 'HIGH' severity findings." });
		digests.push(
			...createDigestsFromFindings(activeFindings, 'HIGH', config.cutOffInDays),
		);
	}

	// *** NOTIFICATION SENDING ***
	logger.log({ message: `Sending ${digests.length} digests.` });
	await Promise.all(
		digests.map(
			async (digest) => await sendDigest(anghammaradClient, config, digest),
		),
	);
}
