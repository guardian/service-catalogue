import { Anghammarad } from '@guardian/anghammarad';
import type { cloudbuster_fsbp_vulnerabilities, PrismaClient } from '@prisma/client';
import { logger } from 'common/logs';
import { getFsbpFindings, getStacks } from 'common/src/database-queries';
import { getPrismaClient } from 'common/src/database-setup';
import type { AwsCloudFormationStack, SecurityHubSeverity } from 'common/src/types';
import { getConfig } from './config';
import { createDigestsFromFindings, sendDigest } from './digests';
import { findingsToGuardianFormat } from './findings';
import type { StackUpdateTimes } from './types';

function stackToUpdateTime(stack: AwsCloudFormationStack, stackStageAppMap: StackUpdateTimes) {
	const key = `${stack.tags.stack}-${stack.tags.stage}-${stack.tags.app}`;
	const lastUpdated = stack.last_updated_time ?? stack.creation_time;
	if (!stackStageAppMap.has(key)) {
		stackStageAppMap.set(key, lastUpdated)
	}
}

async function getStackUpdateTimes(prisma: PrismaClient) {
	/*
	 * Findings relating to EC2 instances will reset their first_observed_at on relaunch.
	 * This usually happens weekly, so we have a lot of findings that (erroneously) appear to be within SLA
	 * If we can match the tags of the instance to a cloudformation stack, using the last_updated_time
	 * is a better (though still imperfect) approximation of when the issue was introduced.
	 *
	 * Writing these to a map is more memory efficient than holding the whole table in memory,
	 * and is more performant than parsing a list of all stacks each time.
	 */

	const taggedStacks = (await getStacks(prisma)).filter(
		(stack) => !!stack.tags.Stack && !!stack.tags.Stage && !!stack.tags.App,
	);
	const stackStageAppMap: StackUpdateTimes = new Map<string, Date>();
	taggedStacks.forEach((stack) => {
		stackToUpdateTime(stack, stackStageAppMap);
	});
	console.log(`Found ${stackStageAppMap.size} stacks with stack, stage and app tags.`);
	return stackStageAppMap;
}



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

	const stackUpdateTimes: StackUpdateTimes = await getStackUpdateTimes(prisma);


	const tableContents: cloudbuster_fsbp_vulnerabilities[] = dbResults.flatMap((res) =>
		findingsToGuardianFormat(res, stackUpdateTimes)
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
