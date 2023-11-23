import type { github_repositories, PrismaClient } from '@prisma/client';
import { findProdCfnStackTags } from '../query';

export async function findReposInProdWithoutProductionTopic(
	prisma: PrismaClient,
	unarchivedRepos: github_repositories[],
) {
	console.log('Discovering Cloudformation stacks with PROD or INFRA tags');
	const reposWithoutProductionTopic = unarchivedRepos
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

	const repoTagsWithProdStacks = await findProdCfnStackTags(prisma);
	console.log(
		`Found ${repoTagsWithProdStacks.length} repos with a PROD or INFRA Cloudformation stack`,
	);

	const guReposWithProdCfnStacks: Array<string | undefined> =
		repoTagsWithProdStacks
			.map((tag) => tag['gu:repo'])
			.filter((r) => !!r) as string[];

	const reposInProdWithoutProductionTopic = reposWithoutProductionTopic.filter(
		(repoName) => repoName && guReposWithProdCfnStacks.includes(repoName),
	);

	console.log(
		`Found ${reposInProdWithoutProductionTopic.length} repos without a production tag that have a PROD or INFRA Cloudformation Stage tag`,
	);

	return reposInProdWithoutProductionTopic;
}
