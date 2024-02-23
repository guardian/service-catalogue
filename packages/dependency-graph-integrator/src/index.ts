import type { SNSHandler } from 'aws-lambda';
import { parseEvent, stageAwareOctokit } from 'common/functions';
import {
	createPrAndAddToProject,
	generateBranchName,
} from 'common/src/pull-requests';
import type { DependencyGraphIntegratorEvent } from 'common/src/types';
import type { Config } from './config';
import { getConfig } from './config';
import { createYaml, generatePr } from './snyk-integrator';

export async function main(event: DependencyGraphIntegratorEvent) {
	console.log(`Generating Dependabot PR for ${event.name}`);
	const config: Config = getConfig();
	const octokit = await stageAwareOctokit(config.stage);
	const branch = generateBranchName('sbt-dependency-graph');
	const [prTitle, prBody] = generatePr(branch);
	await createPrAndAddToProject(
		config.stage,
		octokit,
		event.name,
		'?????', //TODO - add author
		branch,
		prTitle,
		prBody,
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
