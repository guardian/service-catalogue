import { getPrismaClient } from 'common/database';
import { config } from 'dotenv';
import { getConfig } from './config';
import type { ObligationResult } from './obligations';
import { evaluateTaggingObligation } from './obligations/tagging';

config({ path: `../../.env` }); // Load `.env` file at the root of the repository

const Obligations = ['TAGGING'] as const;
export type Obligation = (typeof Obligations)[number];
const stringIsObligation = (input: string): input is Obligation => {
	return Obligations.filter((v) => v === input).length > 0;
};

export async function main(obligation: string) {
	if (!stringIsObligation(obligation)) {
		throw new Error(
			`unknown obligation ${obligation}. Valid ones are: ${Obligations.join(
				', ',
			)}`,
		);
	}

	const config = await getConfig();
	const db = getPrismaClient(config);

	let results: ObligationResult[];

	switch (obligation) {
		case 'TAGGING': {
			results = await evaluateTaggingObligation(db);
		}
	}

	// TODO: Save results to DB
	// log compliance for whole department
	const compliant = results.filter((r) => r.result).length;
	const nonCompliant = results.filter((r) => !r.result).length;
	const total = compliant + nonCompliant;

	console.log(`Total Compliant: ${compliant}`);
	console.log(`Total Un-compliant: ${nonCompliant}`);
	console.log(`Compliance rate: ${(compliant / total) * 100}%`);
}
