import type { SNSHandler } from 'aws-lambda';
import { parseEvent, stageAwareOctokit } from 'common/functions';
import { generateBranchName } from 'common/src/pull-requests';
import type { DependencyGraphIntegratorEvent } from 'common/src/types';
import type { Config } from './config';
import { getConfig } from './config';
import { createYaml, generatePrBody } from './file-generator';
import { createPrAndAddToProject } from './repo-functions';

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
	const yamlContents = createYaml(branch);
	const prContents = generatePrBody(branch, event.name);


	if (config.stage === 'PROD') {
		const octokit = await stageAwareOctokit(config.stage);
		await createPrAndAddToProject(
			config.stage,
			event.name,
			author,
			branch,
			title,
			prContents,
			fileName,
			yamlContents,
			commitMessage,
			boardNumber,
			octokit,
		);
	} else {
		console.log(`Testing generation of ${fileName} for ${event.name}`);
		console.log(yamlContents);
		console.log('Testing PR generation');
		console.log('Title:\n', title);
		console.log('Body:\n', prContents);
	}
}

export const handler: SNSHandler = async (event) => {
	const events = parseEvent<DependencyGraphIntegratorEvent>(event);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we're just testing
	await main(events[0]!);
};
