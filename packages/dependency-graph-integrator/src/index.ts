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

	await createPrAndAddToProject(
		config.stage,
		event.name,
		'?????', //TODO - add author
		branch,
		'Submit sbt dependencies to GitHub for vulnerability monitoring',
		generatePrBody(branch),
		'.github/workflows/sbt-dependency-graph.yml',
		createYaml(branch),
		'Add sbt-dependency-graph.yml',
		NaN, //TODO - add board number
	);
}

export const handler: SNSHandler = async (event) => {
	const events = parseEvent<DependencyGraphIntegratorEvent>(event);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we're just testing
	await main(events[0]!);
};
