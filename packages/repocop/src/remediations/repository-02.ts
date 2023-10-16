import { SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';
import type { SendMessageBatchRequestEntry } from '@aws-sdk/client-sqs/dist-types/models/models_0';
import type { Anghammarad } from '@guardian/anghammarad';
import { RequestedChannel } from '@guardian/anghammarad';
import type {
	github_teams,
	repocop_github_repository_rules,
	view_repo_ownership,
} from '@prisma/client';
import type { Config } from '../config';

/*
 * This interface has been copied from packages/branch-protector/src/model.ts
 * The two interfaces should be kept in sync until we can share the interface.
 */
export interface UpdateBranchProtectionEvent {
	fullName: string; // in the format of owner/repo-name
	teamNameSlugs: string[];
}

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

function shuffle<T>(array: T[]): T[] {
	return array.sort(() => Math.random() - 0.5);
}

export function createRepository02Messages(
	evaluatedRepos: repocop_github_repository_rules[],
	repoOwners: view_repo_ownership[],
	teams: github_teams[],
	msgCount: number,
): UpdateBranchProtectionEvent[] {
	const reposWithoutBranchProtection = evaluatedRepos.filter(
		(repo) => !repo.repository_02,
	);
	const repo02WithContactableOwners = reposWithoutBranchProtection
		.map((repo) => {
			return {
				fullName: repo.full_name,
				teamNameSlugs: findContactableOwners(repo.full_name, repoOwners, teams),
			};
		})
		.filter((repo) => repo.teamNameSlugs.length > 0);

	const resultsCount = repo02WithContactableOwners.length;

	const sliceLength = Math.min(resultsCount, msgCount);

	return shuffle(repo02WithContactableOwners).slice(0, sliceLength);
}

// TODO: test this function
function createEntry(
	message: UpdateBranchProtectionEvent,
): SendMessageBatchRequestEntry {
	return {
		Id: 'repository_02',
		MessageBody: JSON.stringify(message),
	};
}

export async function addMessagesToQueue(
	events: UpdateBranchProtectionEvent[],
	config: Config,
): Promise<void> {
	const sqsClient = new SQSClient({});
	const command = new SendMessageBatchCommand({
		QueueUrl: config.queueUrl,
		Entries: events.map((event) => createEntry(event)),
	});
	await sqsClient.send(command);
}

async function notifyOneTeam(
	anghammaradClient: Anghammarad,
	fullName: string,
	teamSlug: string,
	config: Config,
) {
	await anghammaradClient.notify({
		subject: 'Hello',
		message: `Branch protections will be applied to${fullName}. No action required.`,
		actions: [], //TODO: add link to best practices.
		target: { GithubTeamSlug: teamSlug },
		channel: RequestedChannel.PreferHangouts,
		sourceSystem: 'branch-protector',
		topicArn: config.anghammaradSnsTopic,
	});

	console.log(`Notified ${teamSlug} about ${fullName}`);
}

async function notifyOneRepo(
	anghammaradClient: Anghammarad,
	event: UpdateBranchProtectionEvent,
	config: Config,
) {
	for (const slug of event.teamNameSlugs) {
		await notifyOneTeam(anghammaradClient, event.fullName, slug, config);
	}

	console.log(`Notified all teams about ${event.fullName}`);
}

export async function sendNotifications(
	anghammaradClient: Anghammarad,
	events: UpdateBranchProtectionEvent[],
	config: Config,
): Promise<void> {
	for (const event of events) {
		await notifyOneRepo(anghammaradClient, event, config);
	}
}
