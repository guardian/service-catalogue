import { SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';
import type { SendMessageBatchRequestEntry } from '@aws-sdk/client-sqs/dist-types/models/models_0';
import type { Anghammarad } from '@guardian/anghammarad';
import { RequestedChannel } from '@guardian/anghammarad';
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

function findTeamSlugFromId(
	id: bigint,
	teams: github_teams[],
): string | undefined {
	const match: github_teams | undefined = teams.find((team) => team.id === id);
	return match?.slug ?? undefined;
}

function findContactableOwners(
	repo: string,
	allRepoOwners: view_repo_ownership[],
	teams: github_teams[],
): string[] {
	const owners = allRepoOwners.filter((owner) => owner.full_name === repo);
	const teamSlugs = owners
		.map((owner) => findTeamSlugFromId(owner.github_team_id, teams))
		.filter((slug): slug is string => !!slug);

	return teamSlugs;
}

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

export function createEntry(
	message: UpdateBranchProtectionEvent,
): SendMessageBatchRequestEntry {
	const repoNoSpecialCharacters = message.fullName.replace(/\W/g, '');
	return {
		Id: repoNoSpecialCharacters,
		MessageBody: JSON.stringify(message),
		MessageGroupId: 'repocop',
	};
}

export async function addMessagesToQueue(
	events: UpdateBranchProtectionEvent[],
	config: Config,
): Promise<void> {
	const sqsClient = new SQSClient({
		region: config.region,
		credentials: getLocalProfile(config.stage),
	});
	const command = new SendMessageBatchCommand({
		QueueUrl: config.queueUrl,
		Entries: events.map((event) => createEntry(event)),
	});
	await sqsClient.send(command);

	const repoListString = events.map((event) => event.fullName).join(', ');
	console.log(`Repos added to branch protector queue: ${repoListString}`);
}

async function notifyOneTeam(
	anghammaradClient: Anghammarad,
	fullName: string,
	teamSlug: string,
	config: Config,
) {
	const { app, stage, anghammaradSnsTopic } = config;

	await anghammaradClient.notify({
		subject: `Repocop branch protection (for GitHub team ${teamSlug})`,
		message: `Branch protections will be applied to ${fullName}. No action is required.`,
		actions: branchProtectionCtas(fullName, teamSlug),
		target: { GithubTeamSlug: teamSlug },
		channel: RequestedChannel.PreferHangouts,
		sourceSystem: `${app} ${stage}`,
		topicArn: anghammaradSnsTopic,
		threadKey: anghammaradThreadKey(fullName),
	});

	console.log(`Notified ${teamSlug} about ${fullName}`);
}

async function notifyOneRepo(
	anghammaradClient: Anghammarad,
	event: UpdateBranchProtectionEvent,
	config: Config,
) {
	try {
		await Promise.all(
			event.teamNameSlugs.map(async (slug) => {
				await notifyOneTeam(anghammaradClient, event.fullName, slug, config);
			}),
		);
		console.log(`Notified all teams about ${event.fullName}`);
	} catch (error) {
		console.error(error);
	}
}

export async function sendNotifications(
	anghammaradClient: Anghammarad,
	events: UpdateBranchProtectionEvent[],
	config: Config,
): Promise<void> {
	try {
		await Promise.all(
			events.map(async (event) => {
				await notifyOneRepo(anghammaradClient, event, config);
			}),
		);
	} catch (error) {
		console.error(error);
	}
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
	await addMessagesToQueue(events, config);

	return events;
}

export async function notifyAnghammaradBranchProtection(
	events: UpdateBranchProtectionEvent[],
	config: Config,
	anghammaradClient: Anghammarad,
) {
	await sendNotifications(anghammaradClient, events, config);
}
