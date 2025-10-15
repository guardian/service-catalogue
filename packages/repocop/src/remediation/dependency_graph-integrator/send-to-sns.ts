import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import type { Endpoints } from '@octokit/types';
import type {
	github_languages,
	github_repository_custom_properties,
	guardian_github_actions_usage,
	view_repo_ownership,
} from 'common/generated/prisma/client.js';
import { awsClientConfig } from 'common/src/aws.js';
import { shuffle } from 'common/src/functions.js';
import { logger } from 'common/src/logs.js';
import type {
	DependencyGraphIntegratorEvent,
	DepGraphLanguage,
	Repository,
	RepositoryWithDepGraphLanguage,
} from 'common/src/types.js';
import type { Octokit } from 'octokit';
import type { Config } from '../../config.js';
import { findContactableOwners, removeRepoOwner } from '../shared-utilities.js';

export function checkRepoForLanguage(
	repo: Repository,
	languages: github_languages[],
	targetLanguage: string,
): boolean {
	const languagesInRepo: string[] =
		languages.find((language) => language.full_name === repo.full_name)
			?.languages ?? [];
	return languagesInRepo.includes(targetLanguage);
}

export function doesRepoHaveDepSubmissionWorkflowForLanguage(
	repo: Repository,
	workflowUsagesForRepo: guardian_github_actions_usage[],
	language: DepGraphLanguage,
): boolean {
	const actionsForRepo = workflowUsagesForRepo.flatMap(
		(workflow) => workflow.workflow_uses,
	);

	const workflows: Record<DepGraphLanguage, string> = {
		Scala: 'scalacenter/sbt-dependency-submission',
		Kotlin: 'gradle/actions/dependency-submission',
	};

	const dependencySubmissionWorkflow = actionsForRepo.find((action) =>
		action.includes(workflows[`${language}`]),
	);
	if (dependencySubmissionWorkflow) {
		return true;
	}
	return false;
}

type PullRequestParameters =
	Endpoints['GET /repos/{owner}/{repo}/pulls']['parameters'];

type PullRequest =
	Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'][number];

function isGithubAuthor(pull: PullRequest, author: string) {
	return pull.user?.login === author && pull.user.type === 'Bot';
}
export async function getExistingPullRequest(
	octokit: Octokit,
	repoName: string,
	owner: string,
	author: string,
) {
	const pulls = await octokit.paginate(octokit.rest.pulls.list, {
		owner,
		repo: repoName,
		state: 'open',
	} satisfies PullRequestParameters);

	const found = pulls.filter((pull) => isGithubAuthor(pull, author));

	if (found.length > 1) {
		console.warn(
			`Found ${found.length} PRs on ${repoName} - choosing the first.`,
		);
	}

	return found[0];
}

export function createSnsEventsForDependencyGraphIntegration(
	reposWithoutWorkflows: RepositoryWithDepGraphLanguage[],
	repoOwnership: view_repo_ownership[],
): DependencyGraphIntegratorEvent[] {
	const eventsForAllLanguages: DependencyGraphIntegratorEvent[] =
		reposWithoutWorkflows.map((repo) => ({
			name: removeRepoOwner(repo.full_name),
			language: repo.dependency_graph_language,
			admins: findContactableOwners(repo.full_name, repoOwnership),
		}));

	console.log(`Found ${eventsForAllLanguages.length} events to send to SNS`);

	return eventsForAllLanguages;
}

async function sendOneRepoToDepGraphIntegrator(
	config: Config,
	eventToSend: DependencyGraphIntegratorEvent,
) {
	if (config.stage === 'PROD') {
		const publishRequestEntry = new PublishCommand({
			Message: JSON.stringify(eventToSend),
			TopicArn: config.dependencyGraphIntegratorTopic,
		});
		console.log(`Sending ${eventToSend.name} to Dependency Graph Integrator`);
		await new SNSClient(awsClientConfig(config.stage)).send(
			publishRequestEntry,
		);
	} else {
		console.log(
			`Would have sent ${eventToSend.name} to Dependency Graph Integrator`,
		);
	}
}

export function repoIsExempted(
	repo: Repository,
	exemptedCustomProperties: github_repository_custom_properties[],
	language: DepGraphLanguage,
): boolean {
	const exemptedRepo: github_repository_custom_properties | undefined =
		exemptedCustomProperties.find(
			(property) =>
				repo.id === property.repository_id && language === property.value,
		);
	if (exemptedRepo) {
		logger.log({
			message: `${repo.name} is exempted from dependency graph integration for ${language}`,
			numexemptedCustomProperties: exemptedCustomProperties.length,
		});
	}
	return exemptedRepo !== undefined;
}

export function getSuitableReposWithoutWorkflows(
	languages: github_languages[],
	productionRepos: Repository[],
	productionWorkflowUsages: guardian_github_actions_usage[],
	exemptedCustomProperties: github_repository_custom_properties[],
): RepositoryWithDepGraphLanguage[] {
	const depGraphLanguages: DepGraphLanguage[] = ['Scala', 'Kotlin'];

	const allReposWithoutWorkflows: RepositoryWithDepGraphLanguage[] =
		depGraphLanguages.flatMap((language) => {
			const reposWithDepGraphLanguages: Repository[] = productionRepos.filter(
				(repo) => checkRepoForLanguage(repo, languages, language),
			);
			console.log(
				`Found ${reposWithDepGraphLanguages.length} ${language} repos in production`,
			);

			return reposWithDepGraphLanguages
				.filter(
					(repo) => !repoIsExempted(repo, exemptedCustomProperties, language),
				)
				.filter((repo) => {
					const workflowUsagesForRepo = productionWorkflowUsages.filter(
						(workflow) => workflow.full_name === repo.full_name,
					);
					return !doesRepoHaveDepSubmissionWorkflowForLanguage(
						repo,
						workflowUsagesForRepo,
						language,
					);
				})
				.map((repo) => ({ ...repo, dependency_graph_language: language }));
		});

	console.log(
		`Found ${allReposWithoutWorkflows.length} production repos without dependency submission workflows`,
	);
	return allReposWithoutWorkflows;
}

export async function sendReposToDependencyGraphIntegrator(
	config: Config,
	repoLanguages: github_languages[],
	productionRepos: Repository[],
	productionWorkflowUsages: guardian_github_actions_usage[],
	repoCustomProperties: github_repository_custom_properties[],
	repoOwners: view_repo_ownership[],
	repoCount: number,
	octokit: Octokit,
): Promise<void> {
	const reposRequiringDepGraphIntegration: RepositoryWithDepGraphLanguage[] =
		getSuitableReposWithoutWorkflows(
			repoLanguages,
			productionRepos,
			productionWorkflowUsages,
			repoCustomProperties,
		);

	if (reposRequiringDepGraphIntegration.length !== 0) {
		console.log(
			`Found ${reposRequiringDepGraphIntegration.length} repos requiring dependency graph integration`,
		);

		const shuffledRepos = shuffle(reposRequiringDepGraphIntegration);

		const selectedRepos: RepositoryWithDepGraphLanguage[] = [];

		while (selectedRepos.length < repoCount && shuffledRepos.length > 0) {
			const repo = shuffledRepos.pop();
			if (repo) {
				console.log('Checking for existing PR for', repo.name);
				const existingPr = await getExistingPullRequest(
					octokit,
					repo.name,
					'guardian',
					'gu-dependency-graph-integrator[bot]',
				);
				console.log(
					existingPr
						? `Existing PR found for ${repo.name}`
						: `PR not found for ${repo.name}`,
				);
				if (!existingPr) {
					selectedRepos.push(repo);
				}
			}
		}

		const eventsToSend: DependencyGraphIntegratorEvent[] =
			createSnsEventsForDependencyGraphIntegration(selectedRepos, repoOwners);

		for (const event of eventsToSend) {
			await sendOneRepoToDepGraphIntegrator(config, event);
		}
	} else {
		console.log('No suitable repos found to create events for.');
	}
}
