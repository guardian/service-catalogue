import type { WorkflowTemplate } from '@actions/workflow-parser';
import {
	convertWorkflowTemplate,
	NoOperationTraceWriter,
	parseWorkflow,
} from '@actions/workflow-parser';
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
			const uses = getUsesInWorkflowTemplate(template);
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

export function getUsesInWorkflowTemplate(workflowTemplate: WorkflowTemplate): string[] {
    return removeUndefined(
        workflowTemplate.jobs.flatMap((job) => {
            switch (job.type) {
                case 'job': {
                    return getUsesInJob(job);
                }
                case 'reusableWorkflowJob': {
                    const uses: string[] = [];
                    if (typeof job.ref.value === 'string') {
						uses.push(job.ref.value);
					}
                    if (Array.isArray(job.jobs)) {
                        uses.push(...job.jobs.flatMap(getUsesInJob));
                    }
                    return uses;
                }
                default: {
					throw new Error(`Unhandled job type`);
				}
            }
        }),
    );
}

type WorkflowJob = WorkflowTemplate['jobs'][number];
type Step = { uses?: { value: string } };

function getUsesInJob(job: WorkflowJob): string[] {
    const actionSteps = stepsFromWorkflowJob(job).filter(
        (step): step is Step =>
            typeof step === 'object' &&
            'uses' in step &&
            typeof (step as { uses?: { value?: unknown } }).uses?.value === 'string'
    );
    return actionSteps.map((step) => step.uses!.value);
}

function stepsFromWorkflowJob(workflowJob: WorkflowJob): Step[] {
    if (workflowJob.type === 'job' && Array.isArray(workflowJob.steps)) {
        return workflowJob.steps as Step[];
    }
	if (
		workflowJob.type === 'reusableWorkflowJob' &&
		Array.isArray(workflowJob.jobs)
	) {
		// Collect steps from child jobs
		return workflowJob.jobs.flatMap(stepsFromWorkflowJob);
	}
	return [];
}