import { getPrismaClient } from 'common/database';
import { getConfig } from './config';
import {
	getRepositoryName,
	getUsesStringsFromWorkflow,
	getWorkflowRows,
	validateWorkflowRows,
} from './query';

export async function main() {
	const config = await getConfig();
	const prismaClient = getPrismaClient(config);

	const rawWorkflows = await getWorkflowRows(prismaClient);
	const repositoryIds = rawWorkflows.map((row) => row.repository_id);
	const repositories = await getRepositoryName(prismaClient, repositoryIds);
	const workflows = validateWorkflowRows(repositories, rawWorkflows);

	workflows.forEach((workflow) => {
		const uses = getUsesStringsFromWorkflow(workflow.workflowContents);

		console.log(
			`The workflow ${workflow.workflowPath} in repository ${workflow.repositoryFullName} has ${uses.length} 'uses'`,
		);
	});
}
