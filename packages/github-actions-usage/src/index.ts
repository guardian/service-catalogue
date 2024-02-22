import { getPrismaClient } from 'common/database';
import { getConfig } from './config';
import {
	getUsesStringsFromWorkflow,
	getWorkflowRows,
	validateWorkflowRows,
} from './query';

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
