import type {
	repocop_github_repository_rules,
	view_repo_ownership,
} from '@prisma/client';
import type { Repository, UpdateMessageEvent } from 'common/src/types.js';
import type { Octokit } from 'octokit';
import type { Config } from '../../config.js';
import { findContactableOwners } from '../shared-utilities.js';
import { notify as defaultNotify } from './aws-requests.js';
import { setRepoCustomProperty } from './github-requests.js';

const PRODUCTION_STATUS_PROP = 'production_status';
const PRODUCTION_VALUE = 'production';
const DOCUMENTATION_VALUE = 'documentation';
const PROD_STAGE = 'PROD';

function getRepoPropertyValue(repo: Repository): string {
	const topics = repo.topics;
	// prefer 'production' for custom property value if repo has both topics
	if (topics.includes(PRODUCTION_VALUE)) {
		return PRODUCTION_VALUE;
	}
	if (topics.includes(DOCUMENTATION_VALUE)) {
		return DOCUMENTATION_VALUE;
	}
	return 'unclassified';
}

export function createBranchProtectionEvents(
	unprotectedRepoNames: string[],
	repoOwners: view_repo_ownership[],
): UpdateMessageEvent[] {
	return unprotectedRepoNames
		.map((repoName) => {
			return {
				fullName: repoName,
				teamNameSlugs: findContactableOwners(repoName, repoOwners),
			};
		})
		.filter((repo) => repo.teamNameSlugs.length > 0);
}

async function notifyTeams(
	event: UpdateMessageEvent,
	config: Config,
	notifyFn: typeof defaultNotify,
) {
	for (const slug of event.teamNameSlugs) {
		try {
			await notifyFn(event.fullName, config, slug);
			console.log(`Notified team ${slug} about branch protection`);
		} catch (error) {
			console.error(`Unable to notify ${slug} about branch protection`, error);
		}
	}
}

export async function applyBranchProtectionAndMessageTeams(
	evaluatedRepos: repocop_github_repository_rules[],
	repoOwners: view_repo_ownership[],
	config: Config,
	unarchivedRepositories: Repository[],
	octokit: Octokit,
	notifyFn = defaultNotify,
) {
	const unprotectedRepoNames = evaluatedRepos
		.filter((repo) => !repo.branch_protection)
		.map((repo) => repo.full_name);

	const unprotectedRepos = unarchivedRepositories.filter((repo) =>
		unprotectedRepoNames.includes(repo.full_name),
	);

	console.log(`Found ${unprotectedRepos.length} unprotected repos`);

	const stageIsProd = config.stage === PROD_STAGE;

	if (stageIsProd && config.branchProtectionEnabled) {
		const propertyResults = await Promise.allSettled(
			unprotectedRepos.map(async (repo) => {
				const propertyValue = getRepoPropertyValue(repo);
				const customPropertyUpdated = await setRepoCustomProperty(
					octokit,
					config.gitHubOrg,
					repo.name,
					PRODUCTION_STATUS_PROP,
					propertyValue,
				);
				return customPropertyUpdated ? repo.full_name : null;
			}),
		);
		const updatedRepoNames = propertyResults
			.filter(
				(result): result is PromiseFulfilledResult<string | null> =>
					result.status === 'fulfilled' && result.value !== null,
			)
			.map((result) => result.value as string);

		const failedCount = propertyResults.filter(
			(result) => result.status === 'rejected',
		).length;

		console.log(
			`Successfully set custom properties for ${updatedRepoNames.length}/${unprotectedRepoNames.length} repos`,
		);

		if (failedCount > 0) {
			console.error(`Failed to set custom property for ${failedCount} repos`);
		}

		const branchProtectionEvents = createBranchProtectionEvents(
			updatedRepoNames,
			repoOwners,
		);

		console.log(
			`Created ${branchProtectionEvents.length} branch protection events for successfully updated repos`,
		);

		if (branchProtectionEvents.length > 0) {
			const notificationResults = await Promise.allSettled(
				branchProtectionEvents.map((event) =>
					notifyTeams(event, config, notifyFn),
				),
			);

			const notifySucceeded = notificationResults.filter(
				(result) => result.status === 'fulfilled',
			).length;

			const notifyFailed = notificationResults.filter(
				(result) => result.status === 'rejected',
			).length;

			console.log(
				`Sent ${notifySucceeded}/${branchProtectionEvents.length} notifications`,
			);

			if (notifyFailed > 0) {
				console.error(`Failed to send ${notifyFailed} notifications`);
			}
		} else {
			console.log(
				'No notifications to send (no successfully updated repos with owners)',
			);
		}
	} else {
		const reason =
			(!stageIsProd ? ' Not running on PROD.' : '') +
			(!config.branchProtectionEnabled
				? ' Branch protection is disabled in config.'
				: '');
		console.log(`No branch protection action required: ${reason}`);
	}
}
