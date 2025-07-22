import type { PrismaClient } from '@prisma/client';
import { logger } from 'common/logs.js';
import { getPrismaClient } from 'common/src/database-setup.js';
import { config } from 'dotenv';
import { getConfig } from './config.js';
import {
	type Obligation,
	type ObligationResult,
	Obligations,
	stringIsObligation,
} from './obligations/index.js';
import { evaluateFsbpVulnerabilities } from './obligations/aws-vulnerabilities.js';
import { evaluateDependencyVulnerabilityObligation } from './obligations/dependency-vulnerabilities.js';
import {
	evaluateAmiTaggingCoverage,
	evaluateSecurityHubTaggingCoverage,
} from './obligations/tagging.js';

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
		case 'AWS_VULNERABILITIES': {
			return await evaluateFsbpVulnerabilities(db);
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
