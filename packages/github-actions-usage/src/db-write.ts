import type {
	guardian_github_actions_usage,
	PrismaClient,
} from '@prisma/client';

export type DraftGithubActionUsageRow = Omit<
	guardian_github_actions_usage,
	'evaluated_on'
>;

/**
 * Save records to the `guardian_github_actions_usage` table.
 * Each record will be timestamped with the current time.
 *
 * Existing records will be deleted.
 */
export async function saveResults(
	client: PrismaClient,
	results: DraftGithubActionUsageRow[],
) {
	const now = new Date();

	const records: guardian_github_actions_usage[] =
		results.map<guardian_github_actions_usage>((row) => ({
			evaluated_on: now,
			...row,
		}));

	console.log('Clearing the guardian_github_actions_usage table');
	await client.guardian_github_actions_usage.deleteMany();

	console.log(`Saving ${records.length} guardian_github_actions_usage`);
	await client.guardian_github_actions_usage.createMany({ data: records });
}
