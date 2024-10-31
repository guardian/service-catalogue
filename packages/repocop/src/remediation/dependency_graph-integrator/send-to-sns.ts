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
	RepositoryWithDepGraphLanguage,
} from 'common/src/types';
import type { Config } from '../../config';
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

export function getReposWithoutWorkflows(
	languages: github_languages[],
	productionRepos: Repository[],
	productionWorkflowUsages: guardian_github_actions_usage[],
): RepositoryWithDepGraphLanguage[] {
	const depGraphLanguages: DepGraphLanguage[] = ['Scala', 'Kotlin'];
	let allReposWithoutWorkflows: RepositoryWithDepGraphLanguage[] = [];

	depGraphLanguages.forEach((language) => {
		let reposWithDepGraphLanguages: Repository[] = [];

		const repos = productionRepos.filter((repo) =>
			checkRepoForLanguage(repo, languages, language),
		);

		console.log(`Found ${repos.length} ${language} repos in production`);

		reposWithDepGraphLanguages = reposWithDepGraphLanguages.concat(repos);

		const reposWithoutWorkflows = reposWithDepGraphLanguages
			.filter((repo) => {
				const workflowUsagesForRepo = productionWorkflowUsages.filter(
					(workflow) => workflow.full_name === repo.full_name,
				);
				const result = !doesRepoHaveDepSubmissionWorkflowForLanguage(
					repo,
					workflowUsagesForRepo,
					language,
				);
				return result;
			})
			.map((repo) => ({ ...repo, dependency_graph_language: language }));

		allReposWithoutWorkflows = allReposWithoutWorkflows.concat(
			reposWithoutWorkflows,
		);
		console.log(
			`Found ${reposWithoutWorkflows.length} production ${language} repos without dependency submission workflows`,
		);
	});

	return allReposWithoutWorkflows;
}

export async function sendReposToDependencyGraphIntegrator(
	config: Config,
	repoLanguages: github_languages[],
	productionRepos: Repository[],
	productionWorkflowUsages: guardian_github_actions_usage[],
	repoOwners: view_repo_ownership[],
	repoCount: number,
): Promise<void> {
	const reposRequiringDepGraphIntegration: RepositoryWithDepGraphLanguage[] =
		getReposWithoutWorkflows(
			repoLanguages,
			productionRepos,
			productionWorkflowUsages,
		);

	if (reposRequiringDepGraphIntegration.length !== 0) {
		console.log(
			`Found ${reposRequiringDepGraphIntegration.length} repos requiring dependency graph integration`,
		);

		const selectedRepos = shuffle(reposRequiringDepGraphIntegration).slice(
			0,
			repoCount,
		);

		const eventsToSend: DependencyGraphIntegratorEvent[] =
			createSnsEventsForDependencyGraphIntegration(selectedRepos, repoOwners);

		for (const event of eventsToSend) {
			await sendOneRepoToDepGraphIntegrator(config, event);
		}
	} else {
		console.log('No suitable repos found to create events for.');
	}
}
