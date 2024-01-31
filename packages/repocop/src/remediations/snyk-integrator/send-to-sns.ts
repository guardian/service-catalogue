import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import type {
	github_languages,
	repocop_github_repository_rules,
} from '@prisma/client';
import { awsClientConfig } from 'common/src/aws';
import { shuffle } from 'common/src/functions';
import type { SnykIntegratorEvent } from 'common/src/types';
import type { Config } from '../../config';
import { actionSupportedLanguages, ignoredLanguages } from '../../languages';
import { removeRepoOwner } from '../shared-utilities';

export function findUnprotectedRepos(
	evaluatedRepos: repocop_github_repository_rules[],
): repocop_github_repository_rules[] {
	return evaluatedRepos.filter((repo) => !repo.vulnerability_tracking);
}

function eventContainsOnlyActionSupportedLanguages(
	event: SnykIntegratorEvent,
): boolean {
	return event.languages.every((lang) =>
		actionSupportedLanguages.includes(lang),
	);
}

function removeIgnoredLanguages(
	event: SnykIntegratorEvent,
): SnykIntegratorEvent {
	return {
		name: event.name,
		languages: event.languages.filter(
			(lang) => !ignoredLanguages.includes(lang),
		),
	};
}

export function findUntrackedReposWhereIntegrationWillWork(
	evaluatedRepos: repocop_github_repository_rules[],
	githubLanguages: github_languages[],
) {
	const unprotectedRepos = findUnprotectedRepos(evaluatedRepos);

	const unprotectedReposWithLanguages: SnykIntegratorEvent[] =
		unprotectedRepos.map((repo) => {
			const languages =
				githubLanguages.find((lang) => lang.full_name === repo.full_name)
					?.languages ?? [];
			return {
				name: removeRepoOwner(repo.full_name),
				languages,
			};
		});

	const reposWhereAllLanguagesAreSupported = unprotectedReposWithLanguages
		.filter((event) => eventContainsOnlyActionSupportedLanguages(event))
		.map((event) => removeIgnoredLanguages(event))
		.filter((event) => event.languages.length > 0);

	if (reposWhereAllLanguagesAreSupported.length > 0) {
		console.log(
			`Found ${reposWhereAllLanguagesAreSupported.length} untracked repos that can be integrated with Snyk: `,
			reposWhereAllLanguagesAreSupported
				.map((x) => JSON.stringify(x))
				.join(','),
		);
	}

	return reposWhereAllLanguagesAreSupported;
}

export async function sendUnprotectedRepo(
	evaluatedRepos: repocop_github_repository_rules[],
	config: Config,
	githubLanguages: github_languages[],
) {
	const eventToSend = shuffle(
		findUntrackedReposWhereIntegrationWillWork(evaluatedRepos, githubLanguages),
	)[0];

	if (eventToSend) {
		const publishRequestEntry = new PublishCommand({
			Message: JSON.stringify(eventToSend),
			TopicArn: config.snykIntegratorTopic,
		});

		console.log(`Sending ${eventToSend.name} to Snyk Integrator`);
		await new SNSClient(awsClientConfig(config.stage)).send(
			publishRequestEntry,
		);
	} else {
		console.log('No untracked repos found');
	}
}
