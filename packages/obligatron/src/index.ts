import type { PrismaClient } from '@prisma/client';
import { getPrismaClient } from 'common/database';
import { logger } from 'common/logs';
import { config } from 'dotenv';
import { getConfig } from './config';
import {
	type Obligation,
	type ObligationResult,
	Obligations,
	stringIsObligation,
} from './obligations';
import { evaluateDependencyVulnerabilityObligation } from './obligations/aws-security';
import {
	evaluateAmiTaggingCoverage,
	evaluateSecurityHubTaggingCoverage,
} from './obligations/tagging';

config({ path: `../../.env` }); // Load `.env` file at the root of the repository

async function getResults(
	obligation: Obligation,
	db: PrismaClient,
): Promise<ObligationResult[]> {
	switch (obligation) {
		case 'TAGGING': {
			return [
				...(await evaluateSecurityHubTaggingCoverage(db)),
				...(await evaluateAmiTaggingCoverage(db)),
			];
		}
		case 'PRODUCTION_DEPENDENCIES': {
			return await evaluateDependencyVulnerabilityObligation(db);
		}
	}
}

export async function main(obligation: string) {
	if (!stringIsObligation(obligation)) {
		throw new Error(
			`unknown obligation ${obligation}. Valid ones are: ${Obligations.join(
				', ',
			)}`,
		);
	}

	const config = await getConfig();
	const startTime = new Date();

	logger.log({
		message: 'Starting Obligatron',
		obligation,
		withQueryLogging: config.withQueryLogging,
		startTime,
	});

	const db = getPrismaClient(config);

	logger.log({
		message: 'Starting to process obligation resources',
	});

	const results: ObligationResult[] = await getResults(obligation, db);

	logger.log({
		message: 'Finished processing obligation resources, saving results to DB.',
		total: results.length,
	});

	await db.obligatron_results.createMany({
		data: results.map((r) => ({
			date: startTime,
			obligation_name: obligation,
			resource: r.resource,
			reason: r.reason,
			contacts: r.contacts ?? {},
			url: r.url,
		})),
	});

	logger.log({
		message: 'Saved results to DB. Goodbye!',
	});
}
