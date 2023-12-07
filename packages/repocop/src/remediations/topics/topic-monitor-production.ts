import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import type { PrismaClient } from '@prisma/client';
import {
	anghammaradThreadKey,
	applyTopics,
	topicMonitoringProductionTagCtas,
} from 'common/src/functions';
import type { AWSCloudformationStack } from 'common/types';
import type { Octokit } from 'octokit';
import type { Config } from '../../config';
import { getRepoOwnership, getTeams } from '../../query';
import type { Repository } from '../../types';
import { findContactableOwners, removeRepoOwner } from '../shared-utilities';

async function notifyOneTeam(
	fullRepoName: string,
	stackName: string,
	config: Config,
	teamSlug: string,
) {
	const { app, stage, anghammaradSnsTopic } = config;
	const client = new Anghammarad();
	await client.notify({
		subject: `Production topic monitoring (for GitHub team ${teamSlug})`,
		message:
			`The 'production' topic has applied to ${fullRepoName} which has the stack ${stackName}. ` +
			' This is because stack is over three months old and has PROD or INFRA tags.' +
			` Repositories with PROD or INFRA stacks should have a 'production' topic to help with security.` +
			' Visit the links below to learn more about topics and how to add/remove them if you need to.',
		actions: topicMonitoringProductionTagCtas(fullRepoName, teamSlug),
		target: { GithubTeamSlug: teamSlug },
		channel: RequestedChannel.PreferHangouts,
		sourceSystem: `${app} ${stage}`,
		topicArn: anghammaradSnsTopic,
		threadKey: anghammaradThreadKey(fullRepoName),
	});
}

export function getRepoNamesWithoutProductionTopic(
	unarchivedRepos: Repository[],
): string[] {
	return unarchivedRepos
		.filter(
			(repo) =>
				!repo.topics.includes('production') &&
				!repo.topics.includes('interactive'),
		)
		.map((repo) => repo.full_name)
		.filter((name) => !name.includes('interactive'))
		.filter((name) => !!name);
}

export function getReposInProdWithoutProductionTopic(
	reposWithoutProductionTopic: string[],
	awsStacks: AWSCloudformationStack[],
): AWSCloudformationStack[] {
	return awsStacks.filter((stack) => {
		if (!stack.guRepoName) {
			return false;
		}
		return reposWithoutProductionTopic.includes(stack.guRepoName);
	});
}

function isProdStack(stack: AWSCloudformationStack) {
	return (
		!!stack.tags.Stage &&
		(stack.tags.Stage === 'PROD' || stack.tags.Stage === 'INFRA') &&
		stack.tags.Stack !== 'playground' && // Ignore playground stacks
		!!stack.guRepoName
	);
}

function stackIsOlderThan(stack: AWSCloudformationStack, date: Date) {
	if (!stack.creationTime) {
		return false;
	} else {
		return stack.creationTime < date;
	}
}

export function findReposInProdWithoutProductionTopic(
	unarchivedRepos: Repository[],
	stacks: AWSCloudformationStack[],
): AWSCloudformationStack[] {
	console.log('Discovering Cloudformation stacks with PROD or INFRA tags.');

	const repoNamesWithoutProductionTopic: string[] =
		getRepoNamesWithoutProductionTopic(unarchivedRepos);

	const prodStacks: AWSCloudformationStack[] = stacks.filter(isProdStack);

	const threeMonths = new Date();
	threeMonths.setMonth(threeMonths.getMonth() - 3);
	const prodStacksOverThreeMonths: AWSCloudformationStack[] = prodStacks.filter(
		(stack) => stackIsOlderThan(stack, threeMonths),
	);

	console.log(
		`Found ${prodStacksOverThreeMonths.length} Cloudformation stacks with a Stage tag of PROD or INFRA.`,
	);

	const reposInProdWithoutProductionTopic: AWSCloudformationStack[] =
		getReposInProdWithoutProductionTopic(
			repoNamesWithoutProductionTopic,
			prodStacksOverThreeMonths,
		);

	console.log(
		`Found ${reposInProdWithoutProductionTopic.length} repos without a production/interactive topic that have a PROD/INFRA Cloudformation Stage tag.`,
	);

	return reposInProdWithoutProductionTopic;
}

async function applyProductionTopicToOneRepoAndMessageTeams(
	fullRepoName: string,
	stackName: string,
	teamNameSlugs: string[],
	octokit: Octokit,
	config: Config,
): Promise<void> {
	const owner = 'guardian';
	const topic = 'production';
	const shortRepoName = removeRepoOwner(fullRepoName);
	await applyTopics(shortRepoName, owner, octokit, topic);
	for (const teamNameSlug of teamNameSlugs) {
		await notifyOneTeam(fullRepoName, stackName, config, teamNameSlug);
	}
}

export async function applyProductionTopicAndMessageTeams(
	prisma: PrismaClient,
	unarchivedRepos: Repository[],
	stacks: AWSCloudformationStack[],
	octokit: Octokit,
	config: Config,
): Promise<void> {
	const repos: AWSCloudformationStack[] = findReposInProdWithoutProductionTopic(
		unarchivedRepos,
		stacks,
	);

	const repoAndStackNames = repos
		.filter((repo) => !!repo.guRepoName)
		.filter((repo) => !!repo.stackName)
		.map((repo) => {
			return { fullRepoName: repo.guRepoName, stackName: repo.stackName };
		});

	const repoOwners = await getRepoOwnership(prisma);
	const teams = await getTeams(prisma);

	const reposWithContactableOwners = repoAndStackNames
		.map((names) => {
			const fullRepoName = names.fullRepoName ?? '';
			const stackName = names.stackName ?? '';
			const teamNameSlugs = findContactableOwners(
				fullRepoName,
				repoOwners,
				teams,
			);
			return {
				fullName: fullRepoName,
				stackName: stackName,
				teamNameSlugs: teamNameSlugs,
			};
		})
		.filter((contactableRepo) => contactableRepo.teamNameSlugs.length > 0);

	if (config.stage === 'PROD') {
		await Promise.all(
			reposWithContactableOwners.map((repo) =>
				applyProductionTopicToOneRepoAndMessageTeams(
					repo.fullName,
					repo.stackName,
					repo.teamNameSlugs,
					octokit,
					config,
				),
			),
		);
	}
}
