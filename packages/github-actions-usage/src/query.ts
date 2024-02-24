import type {
	guardian_github_actions_usage,
	PrismaClient,
} from '@prisma/client';
import Ajv from 'ajv';
import YAML from 'yaml';
import * as schema from './schema/github-workflow.json';
import type {
	DraftGithubActionUsageRow,
	GithubWorkflow,
	ReadDatabaseRow,
	ValidatedGithubWorkflow,
} from './types';

export function getWorkflows(client: PrismaClient): Promise<ReadDatabaseRow[]> {
	return client.$queryRaw<ReadDatabaseRow[]>`
		SELECT repo.full_name
				 , workflow.path
				 , workflow.contents
		FROM github_workflows AS workflow
	 		JOIN github_repositories repo 
	 	    ON workflow.repository_id = repo.id
		WHERE workflow.contents IS NOT NULL;
	`;
}

export async function saveResults(
	client: PrismaClient,
	results: DraftGithubActionUsageRow[],
) {
	const now = new Date();

	const records: guardian_github_actions_usage[] =
		results.map<guardian_github_actions_usage>((row) => ({
			evaluated_on: now,
			...row,
		}));

	console.log('Clearing the guardian_github_actions_usage table');
	await client.guardian_github_actions_usage.deleteMany();

	console.log(`Saving ${records.length} guardian_github_actions_usage`);
	await client.guardian_github_actions_usage.createMany({ data: records });
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
