import type {
	guardian_github_actions_usage,
	PrismaClient,
} from '@prisma/client';
import Ajv from 'ajv';
import YAML from 'yaml';
import * as schema from './schema/github-workflow.json';
import type {
	GithubActionUsageToSave,
	GithubWorkflow,
	RawGithubRepository,
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

export async function getRepositoryName(
	client: PrismaClient,
	repositoryIds: bigint[],
) {
	const data = await client.github_repositories.findMany({
		select: {
			id: true,
			full_name: true,
		},
		where: {
			id: {
				in: repositoryIds,
			},
		},
	});
	return data.map((row) => row as RawGithubRepository);
}

export async function saveResults(
	client: PrismaClient,
	results: GithubActionUsageToSave[],
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

function getRepositoryNameFromId(
	repositoryRows: RawGithubRepository[],
	repositoryId: bigint,
): string {
	const item = repositoryRows.find((row) => row.id === repositoryId);
	if (!item) {
		throw new Error(`Repository with id ${repositoryId} not found`);
	}
	return item.full_name;
}

export function validateWorkflowRows(
	repositoryRows: RawGithubRepository[],
	workflowRows: RawGithubWorkflow[],
): ValidatedGithubWorkflow[] {
	const ajv = new Ajv({
		// Disable strict mode as we do not author the schema file
		// See https://ajv.js.org/strict-mode.html
		strict: false,
	});

	const maybeData = workflowRows.map((row) => {
		const { contents, path, repository_id } = row;
		const repositoryName = getRepositoryNameFromId(
			repositoryRows,
			repository_id,
		);

		if (!contents) {
			console.warn(
				`Failed to read workflow as it is empty - path:${path} repository:${repositoryName}`,
			);
			return undefined;
		}

		const contentAsJson = YAML.parse(contents) as unknown;
		const isValid = ajv.validate(schema, contentAsJson);

		if (!isValid) {
			console.error(
				`Failed to read workflow as it violates the schema - path:${path} repository:${repositoryName}`,
			);
			return undefined;
		}

		return {
			repositoryFullName: repositoryName,
			repositoryId: repository_id,
			workflowPath: path,
			workflowContents: contentAsJson as GithubWorkflow,
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
