import type { PrismaClient } from '@prisma/client';
import { getPrismaClient } from 'common/database';
import { config } from 'dotenv';
import { getConfig } from './config';
import type { ObligationResult } from './obligations';
import {
	evaluateAmiTaggingCoverage,
	evaluateSecurityHubTaggingCoverage,
} from './obligations/tagging';

config({ path: `../../.env` }); // Load `.env` file at the root of the repository

const Obligations = ['TAGGING'] as const;
export type Obligation = (typeof Obligations)[number];
const stringIsObligation = (input: string): input is Obligation => {
	return Obligations.filter((v) => v === input).length > 0;
};

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

	console.log({
		message: 'Starting Obligatron',
		obligation,
		stage: config.stage,
		withQueryLogging: config.withQueryLogging,
		startTime,
	});

	const db = getPrismaClient(config);

	console.log({
		message: 'Starting to process obligation resources',
	});

	const results: ObligationResult[] = await getResults(obligation, db);

	console.log({
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

	console.log({
		message: 'Saved results to DB. Goodbye!',
	});
}
