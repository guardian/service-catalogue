import { SQSClient } from '@aws-sdk/client-sqs';
import type { Anghammarad } from '@guardian/anghammarad';
import type {
	github_repositories,
	github_teams,
	PrismaClient,
	repocop_github_repository_rules,
	view_repo_ownership,
} from '@prisma/client';
import { awsClientConfig } from 'common/src/aws';
import { shuffle } from 'common/src/functions';
import type { UpdateMessageEvent } from 'common/types';
import type { Config } from '../config';
import { getRepoOwnership, getTeams } from '../query';
import {
	addMessagesToQueue,
	findContactableOwners,
	RemediationApp,
	sendNotifications,
} from './shared-utilities';

export function createBranchProtectionWarningMessageEvents(
	evaluatedRepos: repocop_github_repository_rules[],
	repoOwners: view_repo_ownership[],
	teams: github_teams[],
	msgCount: number,
): UpdateMessageEvent[] {
	const reposWithoutBranchProtection = evaluatedRepos.filter(
		(repo) => !repo.branch_protection,
	);
	const reposWithContactableOwners = reposWithoutBranchProtection
		.map((repo) => {
			return {
				fullName: repo.full_name,
				teamNameSlugs: findContactableOwners(repo.full_name, repoOwners, teams),
			};
		})
		.filter((repo) => repo.teamNameSlugs.length > 0);

	const resultsCount = reposWithContactableOwners.length;

	const sliceLength = Math.min(resultsCount, msgCount);

	return shuffle(reposWithContactableOwners).slice(0, sliceLength);
}

export async function notifyBranchProtector(
	prisma: PrismaClient,
	evaluatedRepos: repocop_github_repository_rules[],
	config: Config,
	unarchivedRepositories: github_repositories[],
) {
	const repoOwners = await getRepoOwnership(prisma);
	const teams = await getTeams(prisma);

	//repos with a 'production' or 'documentation' topic
	const productionOrDocs = unarchivedRepositories
		.filter(
			(repo) =>
				repo.topics.includes('production') ||
				repo.topics.includes('documentation'),
		)
		.map((repo) => repo.full_name);

	const relevantRepos = evaluatedRepos.filter((repo) =>
		productionOrDocs.includes(repo.full_name),
	);

	const branchProtectionWarningMessages =
		createBranchProtectionWarningMessageEvents(
			relevantRepos,
			repoOwners,
			teams,
			3,
		);

	const sqsClient = new SQSClient(awsClientConfig);

	await addMessagesToQueue(
		branchProtectionWarningMessages,
		sqsClient,
		config.branchProtectorQueueUrl,
		RemediationApp.BranchProtector,
	);

	return branchProtectionWarningMessages;
}

export async function notifyAnghammaradBranchProtection(
	events: UpdateMessageEvent[],
	config: Config,
	anghammaradClient: Anghammarad,
): Promise<void> {
	await sendNotifications(
		anghammaradClient,
		events,
		config,
		RemediationApp.BranchProtector,
	);
}
