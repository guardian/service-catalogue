import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import type { github_repositories, PrismaClient } from '@prisma/client';
import {
	anghammaradThreadKey,
	applyTopics,
	topicMonitoringProductionTagCtas,
} from 'common/src/functions';
import type { AWSCloudformationTag } from 'common/types';
import type { Octokit } from 'octokit';
import type { Config } from '../config';
import { findProdCfnStackTags, getRepoOwnership, getTeams } from '../query';
import { findContactableOwners } from './shared-utilities';

async function notifyOneTeam(
	fullRepoName: string,
	config: Config,
	teamSlug: string,
) {
	const { app, stage, anghammaradSnsTopic } = config;
	const client = new Anghammarad();
	await client.notify({
		subject: `Production topic monitoring (for GitHub team ${teamSlug})`,
		message:
			`The production topic has applied to ${fullRepoName} as it appears to have a PROD or INFRA stack in AWS.` +
			`Repositories should have one of the following topics, to help understand what is in production: production, testing, documentation, hackday, prototype, learning, interactive`,
		actions: topicMonitoringProductionTagCtas(fullRepoName, teamSlug),
		target: { GithubTeamSlug: teamSlug },
		channel: RequestedChannel.PreferHangouts,
		sourceSystem: `${app} ${stage}`,
		topicArn: anghammaradSnsTopic,
		threadKey: anghammaradThreadKey(fullRepoName),
	});
}

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

async function applyProductionTopicToOneRepoAndMessageTeams(
	repoName: string,
	teamNameSlugs: string[],
	octokit: Octokit,
	config: Config,
) {
	const owner = 'guardian';
	const topic = 'production';
	await applyTopics(repoName, owner, octokit, topic);
	for (const teamNameSlug of teamNameSlugs) {
		await notifyOneTeam(`${owner}/repoName`, config, teamNameSlug);
	}
}

export async function applyProductionTopicAndMessageTeams(
	prisma: PrismaClient,
	unarchivedRepos: github_repositories[],
	octokit: Octokit,
	config: Config,
): Promise<void> {
	const fullRepoNames: string[] = await findReposInProdWithoutProductionTopic(
		prisma,
		unarchivedRepos,
	);

	const repoOwners = await getRepoOwnership(prisma);
	const teams = await getTeams(prisma);

	const reposWithContactableOwners = fullRepoNames
		.map((fullRepoName) => {
			return {
				fullName: fullRepoName,
				teamNameSlugs: findContactableOwners(fullRepoName, repoOwners, teams),
			};
		})
		.filter((contactableRepo) => contactableRepo.teamNameSlugs.length > 0);

	await Promise.all(
		reposWithContactableOwners.map((repo) =>
			applyProductionTopicToOneRepoAndMessageTeams(
				repo.fullName,
				repo.teamNameSlugs,
				octokit,
				config,
			),
		),
	);
}
