import type { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import YAML from 'yaml';
import * as schema from './schema/github-workflow.json';
import type {
	GithubWorkflow,
	RawGithubWorkflow,
	ValidatedGithubWorkflow,
} from './types';

export async function getWorkflowRows(client: PrismaClient) {
	const data = await client.github_workflows.findMany({
		select: {
			contents: true,
			path: true,
			repository_id: true,
		},
	});
	return data.map((row) => row as RawGithubWorkflow);
}

export function validateWorkflowRows(
	databaseRows: RawGithubWorkflow[],
): ValidatedGithubWorkflow[] {
	const ajv = new Ajv({
		// Disable strict mode as we do not author the schema file
		// See https://ajv.js.org/strict-mode.html
		strict: false,
	});

	const maybeData = databaseRows.map((row) => {
		const { contents, path, repository_id } = row;
		if (!contents) {
			console.warn(
				`Failed to read workflow as it is empty - path:${path} repository:${repository_id}`,
			);
			return undefined;
		}

		const contentAsJson = YAML.parse(contents) as unknown;
		const isValid = ajv.validate(schema, contentAsJson);

		if (!isValid) {
			console.error(
				`Failed to read workflow as it violates the schema - path:${path} repository:${repository_id}`,
			);
			return undefined;
		}

		return {
			path,
			repository_id,
			contents: contentAsJson as GithubWorkflow,
		} as ValidatedGithubWorkflow;
	});

	const data = maybeData.filter(
		(workflow) => workflow !== undefined,
	) as ValidatedGithubWorkflow[];

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
