import type { PrismaClient } from '@prisma/client';
import Ajv from 'ajv';
import { getPrismaClient } from 'common/database';
import YAML from 'yaml';
import { getConfig } from './config';
import * as schema from './schema/github-workflow.json';
import type {
	GithubWorkflow,
	RawGithubWorkflow,
	ValidatedGithubWorkflow,
} from './types';

async function getWorkflowRows(client: PrismaClient) {
	const data = await client.github_workflows.findMany({
		select: {
			contents: true,
			path: true,
			repository_id: true,
		},
	});
	return data.map((row) => row as RawGithubWorkflow);
}

function validateWorkflowRows(
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

export async function main() {
	const config = await getConfig();
	const prismaClient = getPrismaClient(config);

	const rows = await getWorkflowRows(prismaClient);
	const workflows = validateWorkflowRows(rows);

	workflows.forEach((workflow) => {
		const uses = getUsesStringsFromWorkflow(workflow.contents);

		console.log(
			`The workflow ${workflow.path} in repository ${workflow.repository_id} has ${uses.length} 'uses'`,
		);
	});
}
