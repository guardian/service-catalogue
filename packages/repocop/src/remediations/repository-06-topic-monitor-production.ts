import type { github_repositories, PrismaClient } from '@prisma/client';
import { applyTopics } from 'common/functions';
import type { AWSCloudformationTag } from 'common/types';
import type { Octokit } from 'octokit';
import { findProdCfnStackTags } from '../query';

export function getReposWithoutProductionTopic(
	unarchivedRepos: github_repositories[],
): string[] {
	return unarchivedRepos
		.filter(
			(repo) =>
				!repo.topics.includes('production') &&
				!repo.topics.includes('interactive'),
		)
		.map((repo) => repo.full_name)
		.filter((name) => !name?.includes('interactive'))
		.filter((name) => !!name) as string[];
}

export function getGuRepoNames(tags: AWSCloudformationTag[]): string[] {
	return tags.map((tag) => tag['gu:repo']).filter((r) => !!r) as string[];
}

export function getReposInProdWithoutProductionTopic(
	reposWithoutProductionTopic: string[],
	guReposWithProdCfnStacks: string[],
) {
	return reposWithoutProductionTopic.filter((repoName) =>
		guReposWithProdCfnStacks.includes(repoName),
	);
}

async function findReposInProdWithoutProductionTopic(
	prisma: PrismaClient,
	unarchivedRepos: github_repositories[],
) {
	console.log('Discovering Cloudformation stacks with PROD or INFRA tags');
	const reposWithoutProductionTopic: string[] =
		getReposWithoutProductionTopic(unarchivedRepos);
	console.log(
		`Found ${reposWithoutProductionTopic.length} repositories without a production or interactive topic`,
	);

	const repoTagsWithProdCfnStacks = await findProdCfnStackTags(prisma);

	const guReposWithProdCfnStacks: string[] = getGuRepoNames(
		repoTagsWithProdCfnStacks,
	);

	console.log(
		`Found ${guReposWithProdCfnStacks.length} repos with a PROD or INFRA Cloudformation stack`,
	);

	const reposInProdWithoutProductionTopic =
		getReposInProdWithoutProductionTopic(
			reposWithoutProductionTopic,
			guReposWithProdCfnStacks,
		);

	console.log(
		`Found ${reposInProdWithoutProductionTopic.length} repos without a production tag that have a PROD or INFRA Cloudformation Stage tag`,
	);

	return reposInProdWithoutProductionTopic;
}

export function removeGuardian(fullRepoName: string): string {
	const reponame = fullRepoName.split('/')[1];
	return reponame ?? '';
}

export async function applyProductionTopic(
	prisma: PrismaClient,
	unarchivedRepos: github_repositories[],
	octokit: Octokit,
): Promise<void> {
	const repos: string[] = await findReposInProdWithoutProductionTopic(
		prisma,
		unarchivedRepos,
	);
	const reponames = repos.map((repo) => removeGuardian(repo));
	const owner = 'guardian'; // TODO: make this DRYer

	await Promise.all(
		reponames.map((reponame) =>
			applyTopics(reponame, owner, octokit, 'production'),
		),
	);
}
