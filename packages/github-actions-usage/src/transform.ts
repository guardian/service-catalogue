import type { WorkflowTemplate } from '@actions/workflow-parser';
import {
	convertWorkflowTemplate,
	NoOperationTraceWriter,
	parseWorkflow,
} from '@actions/workflow-parser';
import type {
	ActionStep,
	Step,
	WorkflowJob,
} from '@actions/workflow-parser/model/workflow-template';
import type { RawGithubWorkflow } from './db-read.js';
import type { UnsavedGithubActionUsage } from './db-write.js';

export function removeUndefined<T>(array: Array<T | undefined>): T[] {
	return array.filter((item): item is T => item !== undefined);
}

export interface GithubWorkflow {
	repository: string;
	path: string;
	template: WorkflowTemplate;
}

/**
 * Transform a GitHub Workflow as read from the `github_workflows` table,
 * into a row for the `github_action_usage` table.
 */
export async function extractGithubUsesStrings(
	rawWorkflows: RawGithubWorkflow[],
): Promise<UnsavedGithubActionUsage[]> {
	const workflows: GithubWorkflow[] = removeUndefined(
		await Promise.all(
			rawWorkflows.map((workflow) => getWorkflowTemplate(workflow)),
		),
	);

	console.log(
		`GitHub Workflow summary: total ${rawWorkflows.length}, valid ${workflows.length}, invalid ${rawWorkflows.length - workflows.length}`,
	);

	return workflows.map<UnsavedGithubActionUsage>(
		({ repository, path, template }) => {
			const uses = getUsesInWorkflowTemplate(template) as string[];
			console.log(
				`The workflow ${path} in repository ${repository} has ${uses.length} 'uses'`,
			);
			return {
				full_name: repository,
				workflow_path: path,
				workflow_uses: uses,
			};
		},
	);
}

/**
 * Validate the contents of the `github_workflows` table against the YAML schema for GitHub Workflows.
 *
 * This is necessary as CloudQuery does not guarantee its validity
 * because it saves the result from the get repository content API.
 *
 * @see https://github.com/cloudquery/cloudquery/blob/main/plugins/source/github/resources/services/actions/workflows.go
 * @see https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#get-repository-content
 */
export async function getWorkflowTemplate(
	rawWorkflow: RawGithubWorkflow,
): Promise<GithubWorkflow | undefined> {
	const { path, contents, full_name } = rawWorkflow;

	const result = parseWorkflow(
		{
			name: path,
			content: contents,
		},
		new NoOperationTraceWriter(),
	);
	const errors = result.context.errors.getErrors();

	if (errors.length > 0) {
		console.error(
			`Failed to parse workflow - path:${path} repository:${full_name} errors:${errors.length}`,
			errors.map(({ message }) => message),
		);
		return undefined;
	}

	if (!result.value) {
		console.error(
			`Failed to parse workflow - path:${path} repository:${full_name} value is null`,
		);
		return undefined;
	}

	return {
		repository: rawWorkflow.full_name,
		path: rawWorkflow.path,
		template: await convertWorkflowTemplate(result.context, result.value),
	};
}

export function getUsesInWorkflowTemplate(workflowTemplate: WorkflowTemplate) {
	return removeUndefined(
		workflowTemplate.jobs.flatMap((job) => {
			switch (job.type) {
				case 'job': {
					return getUsesInJob(job);
				}
				case 'reusableWorkflowJob': {
					if (!job.jobs) {
						return [job.ref.value];
					}

					return job.jobs.flatMap((job) => getUsesInJob(job));
				}
				default: {
					const _exhaustiveCheck: never = job;
					return _exhaustiveCheck;
				}
			}
		}),
	);
}

function getUsesInJob(job: WorkflowJob): string[] {
	const actionSteps = stepsFromWorkflowJob(job).filter(
		(step): step is ActionStep => 'uses' in step,
	);
	return actionSteps.map((step) => step.uses.value);
}

function stepsFromWorkflowJob(workflowJob: WorkflowJob): Step[] {
	if (workflowJob.type === 'job') {
		return workflowJob.steps;
	}
	const childJobs = workflowJob.jobs ?? [];
	return childJobs.flatMap(stepsFromWorkflowJob);
}
