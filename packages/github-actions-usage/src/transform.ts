import Ajv from 'ajv';
import YAML from 'yaml';
import type { ReadDatabaseRow } from './db-read';
import type { DraftGithubActionUsageRow } from './db-write';
import * as schema from './schema/github-workflow.json';

export interface GithubWorkflowStep {
	name?: string;
	uses?: string;
}

export interface GithubWorkflow {
	/**
	 * Those jobs that consist of one step can be defined as a single object.
	 * Examples of single step workflows can be found in the `snyk.yaml` workflows.
	 * @see https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idsteps
	 * @see https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_iduses
	 */
	jobs: Record<
		string,
		| {
				steps: GithubWorkflowStep[];
		  }
		| GithubWorkflowStep
	>;
}

export interface ValidatedGithubWorkflow {
	repositoryFullName: string;
	workflowPath: string;
	workflowContents: GithubWorkflow;
}

export function transform(
	rows: ReadDatabaseRow[],
): DraftGithubActionUsageRow[] {
	const workflows = validateWorkflowRows(rows);

	return workflows.map<DraftGithubActionUsageRow>((workflow) => {
		const uses = getUsesStringsFromWorkflow(workflow.workflowContents);
		console.log(
			`The workflow ${workflow.workflowPath} in repository ${workflow.repositoryFullName} has ${uses.length} 'uses'`,
		);
		return {
			full_name: workflow.repositoryFullName,
			workflow_path: workflow.workflowPath,
			workflow_uses: uses,
		};
	});
}

export function validateWorkflowRows(
	rows: ReadDatabaseRow[],
): ValidatedGithubWorkflow[] {
	const ajv = new Ajv({
		// Disable strict mode as we do not author the schema file
		// See https://ajv.js.org/strict-mode.html
		strict: false,
	});

	const maybeData = rows.map((row) => {
		const { full_name, path, contents } = row;

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
			repositoryFullName: full_name,
			workflowPath: path,
			workflowContents: contentAsJson as GithubWorkflow,
		} as ValidatedGithubWorkflow;
	});

	const data = removeUndefined(maybeData);

	console.log(
		`GitHub Workflow summary: total ${maybeData.length}, valid ${data.length}, invalid ${maybeData.length - data.length}`,
	);

	return data;
}

export function getUsesStringsFromWorkflow(workflow: GithubWorkflow): string[] {
	return Object.values(workflow.jobs).flatMap((job) => {
		if ('steps' in job) {
			return job.steps.map((step) => step.uses).filter(Boolean) as string[];
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
