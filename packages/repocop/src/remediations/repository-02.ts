import { SendMessageBatchCommand, SQSClient } from '@aws-sdk/client-sqs';
import type { SendMessageBatchRequestEntry } from '@aws-sdk/client-sqs/dist-types/models/models_0';
import { fromIni } from '@aws-sdk/credential-providers';
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

	//return teamSlugs;

	// TODO: remove this when testing over (limits to DevX repos only)
	const devxTeams = [
		'developer-experience',
		'devx-operations',
		'devx-security',
		'devx-reliability',
	];
	const devxSlugs = teamSlugs.filter((slug): slug is string =>
		devxTeams.includes(slug),
	);
	return devxSlugs;
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
	const credentials =
		config.stage === 'DEV' ? fromIni({ profile: 'deployTools' }) : undefined;
	const sqsClient = new SQSClient({
		region: config.region,
		credentials,
	});
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
	const githubUrl = `https://github.com/${fullName}`;
	const grafanaUrl = `https://metrics.gutools.co.uk/d/EOPnljWIz/repocop-compliance?var-team=${teamSlug}&var-rule=All&orgId=1`;
	const protectionUrl = `https://github.com/${fullName}/settings/branches`;
	const actions = [
		//duplicated in branch protector
		{ cta: 'Repository', url: githubUrl },
		{
			cta: 'Compliance information for repos',
			url: grafanaUrl,
		},
		{
			cta: 'Branch protections',
			url: protectionUrl,
		},
	];

	await anghammaradClient.notify({
		subject: 'Repocop branch protection',
		message: `Branch protections will be applied to ${fullName}. No action is required.`,
		actions,
		target: { GithubTeamSlug: teamSlug },
		channel: RequestedChannel.PreferHangouts,
		sourceSystem: 'branch-protector',
		topicArn: config.anghammaradSnsTopic,
		threadKey: 'service-catalogue',
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
