import type {
	guardian_github_actions_usage,
	PrismaClient,
} from 'common/prisma-client/client.js';

export type UnsavedGithubActionUsage = Omit<
	guardian_github_actions_usage,
	'evaluated_on'
>;

/**
 * Save records to the `guardian_github_actions_usage` table.
 * Each record will receive the same timestamp in its `evaluated_on` column.
 */
export function saveResults(
	client: PrismaClient,
	results: UnsavedGithubActionUsage[],
	timestamp: Date,
) {
	const records: guardian_github_actions_usage[] =
		results.map<guardian_github_actions_usage>((row) => ({
			evaluated_on: timestamp,
			...row,
		}));

	console.log(`Saving ${records.length} guardian_github_actions_usage`);
	return client.guardian_github_actions_usage.createMany({ data: records });
}
