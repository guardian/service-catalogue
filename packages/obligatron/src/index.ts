import { config } from 'dotenv';
import { getPrismaClient } from '../../common/src/database';
import { getConfig } from './config';
import type { ObligationResult } from './obligations';
import { Obligations, stringIsObligation } from './obligations';
import { evaluateTaggingObligation } from './obligations/tagging';

config({ path: `../../.env` }); // Load `.env` file at the root of the repository

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

	let results: ObligationResult[];

	switch (obligation) {
		case 'TAGGING': {
			results = await evaluateTaggingObligation(db);
		}
	}

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
