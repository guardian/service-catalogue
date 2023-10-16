import { SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';
import type { SendMessageBatchRequestEntry } from '@aws-sdk/client-sqs/dist-types/models/models_0';
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

export function createRepository02Messages( //TODO: test this function
	evaluatedRepos: repocop_github_repository_rules[],
	repoOwners: view_repo_ownership[],
	teams: github_teams[],
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

	const allOrFirstFive = Math.min(repo02WithContactableOwners.length, 5);

	return shuffle(repo02WithContactableOwners).slice(0, allOrFirstFive);
}

// TODO: test this function
function createEntry(
	message: UpdateBranchProtectionEvent,
): SendMessageBatchRequestEntry {
	const messageId = 'repository_02_message';
	const stringifiedMessage = JSON.stringify(message);
	const newMessageEntry: SendMessageBatchRequestEntry = {
		Id: messageId,
		MessageBody: stringifiedMessage,
	};
	return newMessageEntry;
}

export async function addMessagesToQueue(
	messages: UpdateBranchProtectionEvent[],
	config: Config,
): Promise<void> {
	const messageStrings: SendMessageBatchRequestEntry[] = messages.map(
		(message) => createEntry(message),
	);
	const sqsClient = new SQSClient({});
	const command = new SendMessageBatchCommand({
		QueueUrl: config.queueUrl,
		Entries: messageStrings,
	});
	await sqsClient.send(command);
}
