import { getPrismaClient } from 'common/database';
import { getConfig } from './config';
import {
	getUsesStringsFromWorkflow,
	getWorkflows,
	saveResults,
	validateWorkflowRows,
} from './query';
import type { DraftGithubActionUsageRow } from './types';

export async function main() {
	const config = await getConfig();
	const prismaClient = getPrismaClient(config);

	const data = await getWorkflows(prismaClient);
	const workflows = validateWorkflowRows(data);

	const recordsToSave: DraftGithubActionUsageRow[] = workflows.map(
		(workflow) => {
			const uses = getUsesStringsFromWorkflow(workflow.workflowContents);
			console.log(
				`The workflow ${workflow.workflowPath} in repository ${workflow.repositoryFullName} has ${uses.length} 'uses'`,
			);
			return {
				full_name: workflow.repositoryFullName,
				workflow_path: workflow.workflowPath,
				workflow_uses: uses,
			};
		},
	);

	await saveResults(prismaClient, recordsToSave);
}
