import type { SNSHandler } from 'aws-lambda';
import { parseEvent } from 'common/functions';
import {
	createPrAndAddToProject,
	generateBranchName,
} from 'common/src/pull-requests';
import type { DependencyGraphIntegratorEvent } from 'common/src/types';
import type { Config } from './config';
import { getConfig } from './config';
import { createYaml, generatePrBody } from './file-generator';

export async function main(event: DependencyGraphIntegratorEvent) {
	console.log(`Generating Dependabot PR for ${event.name}`);
	const config: Config = getConfig();
	const branch = generateBranchName('sbt-dependency-graph');

	const boardNumber = 110;
	const author = 'gu-dependency-graph-integrator'; // TODO: create new 'gu-dependency-graph-integrator' app
	const title =
		'Submit sbt dependencies to GitHub for vulnerability monitoring';
	const fileName = '.github/workflows/sbt-dependency-graph.yaml';
	const commitMessage = 'Add sbt-dependency-graph.yaml';

	await createPrAndAddToProject(
		config.stage,
		event.name,
		author,
		branch,
		title,
		generatePrBody(branch, event.name),
		fileName,
		createYaml(branch),
		commitMessage,
		boardNumber,
	);
}

export const handler: SNSHandler = async (event) => {
	const events = parseEvent<DependencyGraphIntegratorEvent>(event);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we're just testing
	await main(events[0]!);
};
