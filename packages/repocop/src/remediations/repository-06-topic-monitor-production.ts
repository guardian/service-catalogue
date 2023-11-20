import type { PrismaClient } from '@prisma/client';
import type { JsonValue } from '@prisma/client/runtime/library';
import type { Config } from '../config';
import { getUnarchivedRepositories } from '../query';

async function findProdStacks(client: PrismaClient): Promise<string[]> {
	console.log('Discovering stacks with PROD or INFRA tags');
	const stacks = await client.aws_cloudformation_stacks.findMany({
		where: {
			OR: [
				{
					tags: {
						path: ['Stage'],
						equals: 'PROD',
					},
				},
				{
					tags: {
						path: ['Stage'],
						equals: 'INFRA',
					},
				},
			],
			NOT: [{ account_id: 'TODO' }],
		},
	});
	console.log(`Found ${stacks.length} stacks in PROD or INFRA`);
	const stackTags: JsonValue[] = stacks.map((stack) => stack.tags);
	const repoNames: string[] = [];
	const filtered = stackTags.filter((tags) => {
		const tagValues = tags?.valueOf();
		type TagKey = keyof typeof tagValues;
		const guRepoKey = 'gu:repo' as TagKey;
		return Object.hasOwnProperty.call(tagValues, guRepoKey);
	});
	filtered.map((tags) => {
		const tagValues = tags?.valueOf();
		type TagKey = keyof typeof tagValues;
		const guRepoKey = 'gu:repo' as TagKey;
		tagValues &&
			tagValues[guRepoKey] !== 'unknown' &&
			repoNames.push(tagValues[guRepoKey]);
	});
	return repoNames;
}

export async function findReposInProdWithoutProductionTopic(
	prisma: PrismaClient,
	config: Config,
) {
	const reposWithoutProductionTopic = (
		await getUnarchivedRepositories(prisma, config.ignoredRepositoryPrefixes)
	)
		.filter(
			(repo) =>
				!repo.topics.includes('production') &&
				!repo.topics.includes('interactive'),
		)
		.map((repo) => repo.full_name)
		.filter((name) => !name?.includes('interactive'));
	console.log(
		`Found ${reposWithoutProductionTopic.length} repositories without a production topic`,
	);
	const reposWithProdStacks = await findProdStacks(prisma);
	console.log(
		`Found ${reposWithProdStacks.length} repos with a PROD or INFRA stack`,
	);
	const reposInProdWithoutProductionTopic = reposWithoutProductionTopic.filter(
		(repo) => repo && reposWithProdStacks.includes(repo),
	);
	console.log(
		`Found ${reposInProdWithoutProductionTopic.length} repos without a production tag that have a PROD or INFRA stack`,
	);
	return reposInProdWithoutProductionTopic;
}
