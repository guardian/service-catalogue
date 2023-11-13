import { SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';
import type { SendMessageBatchRequestEntry } from '@aws-sdk/client-sqs/dist-types/models/models_0';
import type { Anghammarad } from '@guardian/anghammarad';
import type {
	github_teams,
	PrismaClient,
	repocop_github_repository_rules,
	view_repo_ownership,
} from '@prisma/client';
import {
	anghammaradThreadKey,
	branchProtectionCtas,
	getLocalProfile,
	shuffle,
} from 'common/src/functions';
import type { UpdateBranchProtectionEvent } from 'common/types';
import type { Config } from '../config';
import {
	getRepoOwnership,
	getTeams,
	getUnarchivedRepositories,
} from '../query';
import {
	addMessagesToQueue,
	findContactableOwners,
	RemediationApp,
	sendNotifications,
} from './shared-utilities';

export function createBranchProtectionWarningMessages(
	evaluatedRepos: repocop_github_repository_rules[],
	repoOwners: view_repo_ownership[],
	teams: github_teams[],
	msgCount: number,
): UpdateBranchProtectionEvent[] {
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
) {
	const repoOwners = await getRepoOwnership(prisma);
	const teams = await getTeams(prisma);

	//repos with a 'production' or 'documentation' topic
	const productionOrDocs = (await getUnarchivedRepositories(prisma, []))
		.filter(
			(repo) =>
				repo.topics.includes('production') ||
				repo.topics.includes('documentation'),
		)
		.map((repo) => repo.full_name);

	const relevantRepos = evaluatedRepos.filter((repo) =>
		productionOrDocs.includes(repo.full_name),
	);

	const events = createBranchProtectionWarningMessages(
		relevantRepos,
		repoOwners,
		teams,
		3,
	);
	await addMessagesToQueue(events, config, RemediationApp.BranchProtector);

	return events;
}

export async function notifyAnghammaradBranchProtection(
	events: UpdateBranchProtectionEvent[],
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
