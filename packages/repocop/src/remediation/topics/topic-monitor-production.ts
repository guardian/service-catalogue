import { SNSClient } from '@aws-sdk/client-sns';
import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import { awsClientConfig } from 'common/aws.js';
import type { view_repo_ownership } from 'common/prisma-client/client.js';
import {
	anghammaradThreadKey,
	applyTopics,
	topicMonitoringProductionTagCtas,
} from 'common/src/functions.js';
import { stripMargin } from 'common/src/string.js';
import type { Repository } from 'common/src/types.js';
import type { Octokit } from 'octokit';
import type { Config } from '../../config.js';
import type { AwsCloudFormationStack } from '../../types.js';
import { findContactableOwners, removeRepoOwner } from '../shared-utilities.js';

const MONTHS = 3;
interface AnghammaradTextFields {
	subject: string;
	message: string;
}

export function createMessage(
	fullRepoName: string,
	stackName: string,
	teamSlug: string,
	months: number,
) {
	return {
		subject: `Production topic monitoring (for GitHub team ${teamSlug})`,
		message: stripMargin`
			|The 'production' topic has applied to ${fullRepoName} which has the stack ${stackName}.
			|This is because stack is over ${months} months old and has PROD or INFRA tags.
			|Repositories with PROD or INFRA stacks should have a 'production' topic to help with security.
			|Visit the links below to learn more about topics and how to add/remove them if you need to.`,
	};
}

async function notifyOneTeam(
	fullRepoName: string,
	config: Config,
	teamSlug: string,
	messageTextFields: AnghammaradTextFields,
) {
	const { app, stage, anghammaradSnsTopic } = config;
	const snsClient = new SNSClient(awsClientConfig(stage));
	const client = new Anghammarad(snsClient, anghammaradSnsTopic);
	await client.notify({
		subject: messageTextFields.subject,
		message: messageTextFields.message,
		actions: topicMonitoringProductionTagCtas(fullRepoName, teamSlug),
		target: { GithubTeamSlug: teamSlug },
		channel: RequestedChannel.PreferHangouts,
		sender: `${app} ${stage}`,
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
	awsStacks: AwsCloudFormationStack[],
): AwsCloudFormationStack[] {
	return awsStacks.filter((stack) => {
		if (!stack.tags['gu:repo']) {
			return false;
		}
		return reposWithoutProductionTopic.includes(stack.tags['gu:repo']);
	});
}

function isProdStack(stack: AwsCloudFormationStack) {
	return (
		!!stack.tags.Stage &&
		(stack.tags.Stage === 'PROD' || stack.tags.Stage === 'INFRA') &&
		stack.tags.Stack !== 'playground' && // Ignore playground stacks
		!!stack.tags['gu:repo']
	);
}

function stackIsOlderThan(stack: AwsCloudFormationStack, date: Date) {
	return stack.creation_time < date;
}

export function findReposInProdWithoutProductionTopic(
	unarchivedRepos: Repository[],
	stacks: AwsCloudFormationStack[],
): AwsCloudFormationStack[] {
	console.log('Discovering Cloudformation stacks with PROD or INFRA tags.');

	const repoNamesWithoutProductionTopic: string[] =
		getRepoNamesWithoutProductionTopic(unarchivedRepos);

	const prodStacks = stacks.filter(isProdStack);

	const threeMonths = new Date();
	threeMonths.setMonth(threeMonths.getMonth() - 3);
	const cutoffDate = new Date();
	cutoffDate.setMonth(cutoffDate.getMonth() - MONTHS);
	const oldProdStacks: AwsCloudFormationStack[] = prodStacks.filter((stack) =>
		stackIsOlderThan(stack, cutoffDate),
	);
	console.log(
		`Found ${oldProdStacks.length} Cloudformation stacks with a Stage tag of PROD or INFRA that are over ${MONTHS} months old.`,
	);

	const reposInProdWithoutProductionTopic =
		getReposInProdWithoutProductionTopic(
			repoNamesWithoutProductionTopic,
			oldProdStacks,
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
	const topic = 'production';
	const shortRepoName = removeRepoOwner(fullRepoName);
	const { stage } = config;
	if (stage === 'PROD') {
		await applyTopics(shortRepoName, config.gitHubOrg, octokit, topic);
	} else {
		console.log(
			`Would have applied the ${topic} topic to ${shortRepoName} with stack ${stackName} if stage was PROD.`,
		);
	}
	for (const teamNameSlug of teamNameSlugs) {
		const messageText = createMessage(
			fullRepoName,
			stackName,
			teamNameSlug,
			MONTHS,
		);
		console.log('Production topic monitor message text: ');
		console.log(messageText);
		// have to check the stage again here as we're in the loop
		if (stage === 'PROD') {
			await notifyOneTeam(fullRepoName, config, teamNameSlug, messageText);
		}
	}
}

export async function applyProductionTopicAndMessageTeams(
	unarchivedRepos: Repository[],
	stacks: AwsCloudFormationStack[],
	repoOwners: view_repo_ownership[],
	octokit: Octokit,
	config: Config,
): Promise<void> {
	const repos = findReposInProdWithoutProductionTopic(unarchivedRepos, stacks);

	const repoAndStackNames = repos
		.filter((repo) => !!repo.tags['gu:repo'])
		.filter((repo) => !!repo.stack_name)
		.map((repo) => {
			return { fullRepoName: repo.tags['gu:repo'], stackName: repo.stack_name };
		});

	const reposWithContactableOwners = repoAndStackNames
		.map((names) => {
			const fullRepoName = names.fullRepoName ?? '';
			const stackName = names.stackName;
			const teamNameSlugs = findContactableOwners(fullRepoName, repoOwners);
			return {
				fullName: fullRepoName,
				stackName: stackName,
				teamNameSlugs: teamNameSlugs,
			};
		})
		.filter((contactableRepo) => contactableRepo.teamNameSlugs.length > 0);

	if (reposWithContactableOwners.length > 0) {
		console.log(
			`Found ${reposWithContactableOwners.length} repos with contactable owners for addition of the production topic`,
		);
	}

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
