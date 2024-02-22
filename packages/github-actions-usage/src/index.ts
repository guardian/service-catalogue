import { getPrismaClient } from 'common/database';
import { getConfig } from './config';
import {
	getRepositoryName,
	getUsesStringsFromWorkflow,
	getWorkflowRows,
	saveResults,
	validateWorkflowRows,
} from './query';
import type { GithubActionUsageToSave } from './types';

export async function main() {
	const config = await getConfig();
	const prismaClient = getPrismaClient(config);

	const rawWorkflows = await getWorkflowRows(prismaClient);
	const repositoryIds = rawWorkflows.map((row) => row.repository_id);
	const repositories = await getRepositoryName(prismaClient, repositoryIds);
	const workflows = validateWorkflowRows(repositories, rawWorkflows);

	const recordsToSave: GithubActionUsageToSave[] = workflows.map((workflow) => {
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

	await saveResults(prismaClient, recordsToSave);
}
