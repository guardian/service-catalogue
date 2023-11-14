import { SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';
import type { SendMessageBatchRequestEntry } from '@aws-sdk/client-sqs/dist-types/models/models_0';
import { fromIni } from '@aws-sdk/credential-providers';
import type { Action, Anghammarad } from '@guardian/anghammarad';
import { RequestedChannel } from '@guardian/anghammarad';
import type { github_teams, view_repo_ownership } from '@prisma/client';
import {
	anghammaradThreadKey,
	branchProtectionCtas,
	topicProductionCtas,
} from 'common/src/functions';
import type { UpdateMessageEvent } from 'common/types';
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

export interface AnghammaradMessage {
	subject: string;
	message: string;
	actions: (fullRepoName: string, teamSlug: string) => Action[];
}

type AnghammaradMessages = {
	[key in RemediationApp]: AnghammaradMessage;
};

const anghammaradMessages: AnghammaradMessages = {
	branchProtector: {
		subject: 'Repocop branch protection',
		message: 'Branch protections',
		actions: branchProtectionCtas,
	},
	topicProduction: {
		subject: 'Repocop topic monitoring',
		message: "The 'production' topic",
		actions: topicProductionCtas,
	},
};

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

export function createSqsEntry(
	message: UpdateMessageEvent,
): SendMessageBatchRequestEntry {
	const repoNoSpecialCharacters = message.fullName.replace(/\W/g, '');
	return {
		Id: repoNoSpecialCharacters,
		MessageBody: JSON.stringify(message),
		MessageGroupId: 'repocop',
	};
}

export async function addMessagesToQueue(
	events: UpdateMessageEvent[],
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
		QueueUrl: config[`${app}QueueUrl`],
		Entries: events.map((event) => createSqsEntry(event)),
	});
	await sqsClient.send(command);

	const repoListString = events.map((event) => event.fullName).join(', ');
	console.log(`Repos added to ${app} queue: ${repoListString}`);
}

async function notifyOneTeam(
	anghammaradClient: Anghammarad,
	fullName: string,
	teamSlug: string,
	config: Config,
	anghammaradMessage: AnghammaradMessage,
) {
	const { app, stage, anghammaradSnsTopic } = config;

	await anghammaradClient.notify({
		subject: `${anghammaradMessage.subject} (for GitHub team ${teamSlug})`,
		message: `${anghammaradMessage.message} will be applied to ${fullName}. No action is required.`,
		actions: anghammaradMessage.actions(fullName, teamSlug),
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
	event: UpdateMessageEvent,
	config: Config,
	remediationApp: RemediationApp,
) {
	const anghammaradMessage: AnghammaradMessage =
		anghammaradMessages[remediationApp];
	try {
		await Promise.all(
			event.teamNameSlugs.map(async (slug) => {
				await notifyOneTeam(
					anghammaradClient,
					event.fullName,
					slug,
					config,
					anghammaradMessage,
				);
			}),
		);
		console.log(`Notified all teams about ${event.fullName}`);
	} catch (error) {
		console.error(error);
	}
}

export async function sendNotifications(
	anghammaradClient: Anghammarad,
	events: UpdateMessageEvent[],
	config: Config,
	remediationApp: RemediationApp,
): Promise<void> {
	try {
		await Promise.all(
			events.map(async (event) => {
				await notifyOneRepo(anghammaradClient, event, config, remediationApp);
			}),
		);
	} catch (error) {
		console.error(error);
	}
}
