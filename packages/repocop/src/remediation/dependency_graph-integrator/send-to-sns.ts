import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import type {
	github_languages,
	guardian_github_actions_usage,
} from '@prisma/client';
import { awsClientConfig } from 'common/src/aws';
import { shuffle } from 'common/src/functions';
import type {
	DependencyGraphIntegratorEvent,
	Repository,
} from 'common/src/types';
import type { Config } from '../../config';
import { removeRepoOwner } from '../shared-utilities';

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

export function doesRepoHaveWorkflow(
	repo: Repository,
	workflow_usages: guardian_github_actions_usage[],
): boolean {
	const actionsForRepo = workflow_usages
		.filter((usages) => repo.full_name === usages.full_name)
		.flatMap((workflow) => workflow.workflow_uses);

	const dependencySubmissionWorkflow = actionsForRepo.find((action) =>
		action.includes('scalacenter/sbt-dependency-submission'),
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
): DependencyGraphIntegratorEvent[] {
	const scalaRepos = productionRepos.filter((repo) =>
		checkRepoForLanguage(repo, languages, 'Scala'),
	);

	console.log(`Found ${scalaRepos.length} Scala repos in production`);

	const scalaReposWithoutWorkflows = scalaRepos.filter(
		(repo) => !doesRepoHaveWorkflow(repo, workflow_usages),
	);

	console.log(
		`Found ${scalaRepos.length} production Scala repos without dependency submission workflows`,
	);

	const events = scalaReposWithoutWorkflows.map((repo) => ({
		name: removeRepoOwner(repo.full_name),
	}));
	console.log(`Found ${events.length} events to send to SNS`);
	return events;
}

export async function sendOneRepoToDepGraphIntegrator(
	config: Config,
	repoLanguages: github_languages[],
	productionRepos: Repository[],
	workflowUsages: guardian_github_actions_usage[],
) {
	const eventToSend = shuffle(
		createSnsEventsForDependencyGraphIntegration(
			repoLanguages,
			productionRepos,
			workflowUsages,
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
			'No Scala repos found without SBT dependency submission workflow',
		);
	}
}
