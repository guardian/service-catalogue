import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import type {
	github_languages,
	guardian_github_actions_usage,
	view_repo_ownership,
} from '@prisma/client';
import { awsClientConfig } from 'common/src/aws';
import { shuffle } from 'common/src/functions';
import type {
	DependencyGraphIntegratorEvent,
	DepGraphLanguage,
	Repository,
} from 'common/src/types';
import type { Config } from '../../config';
import type { Team } from '../../types';
import { findContactableOwners, removeRepoOwner } from '../shared-utilities';

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
	workflow_usages: guardian_github_actions_usage[],
	language: DepGraphLanguage,
): boolean {
	const actionsForRepo = workflow_usages
		.filter((usages) => repo.full_name === usages.full_name)
		.flatMap((workflow) => workflow.workflow_uses);

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

export function createSnsEventsForDependencyGraphIntegration(
	languages: github_languages[],
	productionRepos: Repository[],
	workflow_usages: guardian_github_actions_usage[],
	view_repo_ownership: view_repo_ownership[],
	teams: Team[],
): DependencyGraphIntegratorEvent[] {
	const depGraphLanguages: DepGraphLanguage[] = ['Scala', 'Kotlin'];
	const eventsForAllLanguages: DependencyGraphIntegratorEvent[] = [];

	depGraphLanguages.forEach((language) => {
		let reposWithDepGraphLanguages: Repository[] = [];
		const repos = productionRepos.filter((repo) =>
			checkRepoForLanguage(repo, languages, language),
		);
		console.log(`Found ${repos.length} ${language} repos in production`);

		reposWithDepGraphLanguages = reposWithDepGraphLanguages.concat(repos);

		const reposWithoutWorkflows = reposWithDepGraphLanguages.filter(
			(repo) =>
				!doesRepoHaveDepSubmissionWorkflowForLanguage(
					repo,
					workflow_usages,
					language,
				),
		);
		console.log(
			`Found ${reposWithoutWorkflows.length} production repos without ${language} dependency submission workflows`,
		);
		reposWithoutWorkflows.map((repo) =>
			eventsForAllLanguages.push({
				name: removeRepoOwner(repo.full_name),
				language,
				admins: findContactableOwners(
					repo.full_name,
					view_repo_ownership,
					teams,
				),
			}),
		);
	});

	console.log(`Found ${eventsForAllLanguages.length} events to send to SNS`);
	return eventsForAllLanguages;
}

export async function sendOneRepoToDepGraphIntegrator(
	config: Config,
	repoLanguages: github_languages[],
	productionRepos: Repository[],
	workflowUsages: guardian_github_actions_usage[],
	view_repo_ownership: view_repo_ownership[],
	teams: Team[],
) {
	const eventToSend = shuffle(
		createSnsEventsForDependencyGraphIntegration(
			repoLanguages,
			productionRepos,
			workflowUsages,
			view_repo_ownership,
			teams,
		),
	)[0];

	if (eventToSend) {
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
	} else {
		console.log(
			'No suitable production repos found without dependency submission workflow',
		);
	}
}
