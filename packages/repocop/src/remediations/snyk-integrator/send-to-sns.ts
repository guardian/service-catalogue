import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import type {
	github_languages,
	repocop_github_repository_rules,
	view_repo_ownership,
} from '@prisma/client';
import { awsClientConfig } from 'common/src/aws';
import { shuffle } from 'common/src/functions';
import type { SnykIntegratorEvent } from 'common/src/types';
import type { Config } from '../../config';
import { actionSupportedLanguages } from '../../languages';
import { removeRepoOwner } from '../shared-utilities';

export function findUnprotectedRepos(
	evaluatedRepos: repocop_github_repository_rules[],
): repocop_github_repository_rules[] {
	return evaluatedRepos.filter((repo) => !repo.vulnerability_tracking);
}

function findDevXRepos(
	owners: view_repo_ownership[],
	repos: repocop_github_repository_rules[],
): repocop_github_repository_rules[] {
	const devXTeams = owners
		.filter(
			(owner) =>
				owner.github_team_name === 'DevX Security' ||
				owner.github_team_name === 'DevX Operations' ||
				owner.github_team_name === 'DevX Reliability' ||
				owner.github_team_name === 'Developer Experience',
		)
		.map((owner) => owner.repo_name);

	const devXRepos = repos.filter((repo) => devXTeams.includes(repo.full_name));

	return shuffle([...new Set(devXRepos)]);
}

function eventContainsOnlyActionSupportedLanguages(
	event: SnykIntegratorEvent,
): boolean {
	return event.languages.every((lang) =>
		actionSupportedLanguages.includes(lang),
	);
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

	const reposWhereAllLanguagesAreSupported =
		unprotectedReposWithLanguages.filter((event) =>
			eventContainsOnlyActionSupportedLanguages(event),
		);

	console.log(
		`Found ${reposWhereAllLanguagesAreSupported.length} untracked repos that can be integrated with Snyk: `,
		reposWhereAllLanguagesAreSupported.map((x) => JSON.stringify(x)).join(','),
	);

	return reposWhereAllLanguagesAreSupported;
}

export async function sendUnprotectedRepo(
	evaluatedRepos: repocop_github_repository_rules[],
	config: Config,
	owners: view_repo_ownership[],
	githubLanguages: github_languages[],
) {
	//Only use internal repos while we are testing.
	const devXRepos = findDevXRepos(owners, evaluatedRepos);

	const eventToSend = findUntrackedReposWhereIntegrationWillWork(
		devXRepos,
		githubLanguages,
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
