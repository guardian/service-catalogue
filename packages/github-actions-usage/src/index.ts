import Ajv from 'ajv';
import { getPrismaClient } from 'common/database';
import YAML from 'yaml';
import { getConfig } from './config';
import * as schema from './schema/github-workflow.json';

export async function main() {
	const config = await getConfig();
	const prismaClient = getPrismaClient(config);

	const rows = await prismaClient.github_workflows.findMany({
		select: {
			contents: true,
			path: true,
			repository_id: true,
		},
	});

	const ajv = new Ajv({
		// Disable strict mode as we do not author the schema file
		// See https://ajv.js.org/strict-mode.html
		strict: false,
	});

	const maybeWorkflows = rows.map((row) => {
		const { contents, path, repository_id } = row;
		if (!contents) {
			console.warn(
				`Failed to read workflow as it is empty - path:${path} repository:${repository_id}`,
			);
			return undefined;
		}

		const [, err] = parseWorkflow(ajv, contents);
		if (err) {
			console.error(
				`Failed to read workflow as it violates the schema - path:${path} repository:${repository_id}`,
			);
			return undefined;
		}

		console.log(`Workflow is valid - path:${path} repository:${repository_id}`);
		return row;
	});

	const workflows = maybeWorkflows.filter((workflow) => workflow !== undefined);
	console.log(`Total valid workflows: ${workflows.length}`);
	console.log(
		`Total invalid workflows: ${maybeWorkflows.length - workflows.length}`,
	);
}

function parseWorkflow(ajv: Ajv, content: string) {
	const contentAsJson = YAML.parse(content) as unknown;
	const isValid = ajv.validate(schema, contentAsJson);
	return [isValid, ajv.errors];
}
