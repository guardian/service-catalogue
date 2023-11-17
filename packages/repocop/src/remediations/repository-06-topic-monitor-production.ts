import type {
	aws_cloudformation_stacks,
	// github_repositories,
	PrismaClient,
} from '@prisma/client';
import type { Config } from '../config';
import { getUnarchivedRepositories } from '../query';

async function findProdStacks(
	client: PrismaClient,
): Promise<aws_cloudformation_stacks> {
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
		},
	});
	console.log(`Found ${stacks.length} stacks in PROD or INFRA`);
	return stacks;
}

export async function findReposInProdWithoutProductionTopic(
	prisma: PrismaClient,
	config: Config,
) {
	const reposWithoutProductionTopic = (
		await getUnarchivedRepositories(prisma, config.ignoredRepositoryPrefixes)
	)
		.filter((repo) => !repo.topics.includes('production'))
		.map((repo) => repo.full_name);
	console.log(
		`Found ${reposWithoutProductionTopic.length} repositories without a production topic`, // ~2114
	);
	// const reposWithProdStacks = findProdStacks(prisma);

	// const reposInProdWithoutProductionTopic =
	// 	reposWithoutProductionTopic.filter((repo) =>
	// 		reposWithProdStacks.includes(repo),
	// 	);
	// return reposInProdWithoutProductionTopic;
	try {
		await findProdStacks(prisma);
	} catch (error) {
		console.log(error);
	}
}
