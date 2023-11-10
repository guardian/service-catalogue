import { SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';
import type { SendMessageBatchRequestEntry } from '@aws-sdk/client-sqs/dist-types/models/models_0';
import { fromIni } from '@aws-sdk/credential-providers';
import type { Anghammarad } from '@guardian/anghammarad';
import { RequestedChannel } from '@guardian/anghammarad';
import type { github_teams, view_repo_ownership } from '@prisma/client';
import {
	anghammaradThreadKey,
	branchProtectionCtas,
} from 'common/src/functions';
import type { UpdateBranchProtectionEvent } from 'common/types';
import type { Config } from '../config';

function findTeamSlugFromId(
	id: bigint,
	teams: github_teams[],
): string | undefined {
	const match: github_teams | undefined = teams.find((team) => team.id === id);
	return match?.slug ?? undefined;
}

export enum RemediationApp {
	BranchProtector = 'branchProtector',
	TopicProduction = 'topicProduction',
}

export function findContactableOwners(
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
	app: RemediationApp,
): Promise<void> {
	const credentials =
		config.stage === 'DEV' ? fromIni({ profile: 'deployTools' }) : undefined;
	const sqsClient = new SQSClient({
		region: config.region,
		credentials,
	});
	const command = new SendMessageBatchCommand({
		QueueUrl: `config.${app}queueUrl`,
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
