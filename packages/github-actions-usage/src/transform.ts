import Ajv from 'ajv';
import YAML from 'yaml';
import type { RawGithubWorkflow } from './db-read';
import type { UnsavedGithubActionUsage } from './db-write';
import * as schema from './schema/github-workflow.json';

export interface GithubWorkflowFileStep {
	name?: string;
	uses?: string;
}

export interface GithubWorkflowFile {
	/**
	 * Those jobs that consist of one step can be defined as a single object.
	 * Examples of single step workflows can be found in the `snyk.yaml` workflows.
	 * @see https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idsteps
	 * @see https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_iduses
	 */
	jobs: Record<
		string,
		| {
				steps: GithubWorkflowFileStep[];
		  }
		| GithubWorkflowFileStep
	>;
}

export interface GithubWorkflow {
	repository: string;
	path: string;
	content: GithubWorkflowFile;
}

/**
 * Transform a GitHub Workflow as read from the `github_workflows` table,
 * into a row for the `github_action_usage` table.
 */
export function transform(
	rawWorkflows: RawGithubWorkflow[],
): UnsavedGithubActionUsage[] {
	const workflows = removeUndefined(
		rawWorkflows.map((workflow) => validateRawWorkflow(workflow)),
	);

	console.log(
		`GitHub Workflow summary: total ${rawWorkflows.length}, valid ${workflows.length}, invalid ${rawWorkflows.length - workflows.length}`,
	);

	return workflows.map<UnsavedGithubActionUsage>(
		({ repository, path, content }) => {
			const uses = getUsesStringsFromWorkflow(content);
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
export function validateRawWorkflow(
	rawWorkflow: RawGithubWorkflow,
): GithubWorkflow | undefined {
	const ajv = new Ajv({
		// Disable strict mode as we do not author the schema file
		// See https://ajv.js.org/strict-mode.html
		strict: false,
	});

	const { full_name, path, contents } = rawWorkflow;

	if (!contents) {
		console.warn(
			`Failed to read workflow as it is empty - path:${path} repository:${full_name}`,
		);
		return undefined;
	}

	const contentAsJson = yamlToJson(contents);

	if (!contentAsJson) {
		console.error(
			`Failed to read workflow as it is not valid YAML - path:${path} repository:${full_name}`,
		);
		return undefined;
	}

	const isValid = ajv.validate(schema, contentAsJson);

	if (!isValid) {
		console.error(
			`Failed to read workflow as it violates the schema - path:${path} repository:${full_name}`,
		);
		return undefined;
	}

	return {
		repository: full_name,
		path: path,
		content: contentAsJson as GithubWorkflowFile,
	};
}

export function getUsesStringsFromWorkflow(
	workflow: GithubWorkflowFile,
): string[] {
	return Object.values(workflow.jobs).flatMap((job) => {
		if ('steps' in job) {
			return removeUndefined(job.steps.map((step) => step.uses));
		} else {
			return job.uses ? [job.uses] : [];
		}
	});
}

function removeUndefined<T>(array: Array<T | undefined>): T[] {
	return array.filter((item) => item !== undefined) as T[];
}

function yamlToJson(maybeYamlString: string): unknown {
	try {
		return YAML.parse(maybeYamlString);
	} catch (err) {
		console.error('Failed to parse YAML string', err);
		return undefined;
	}
}
