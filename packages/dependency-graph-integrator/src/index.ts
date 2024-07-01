import type { SNSHandler } from 'aws-lambda';
import { parseEvent, stageAwareOctokit } from 'common/functions';
import { generateBranchName } from 'common/src/pull-requests';
import type { DependencyGraphIntegratorEvent } from 'common/src/types';
import type { Config } from './config';
import { getConfig } from './config';
import { createYaml, generatePrBody } from './file-generator';
import {
	createPrAndAddToProject,
	enableDependabotAlerts,
} from './repo-functions';
import type { StatusCode } from './types';

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
	const repo = event.name;
	const prContents = generatePrBody(branch, repo);
	const stage = config.stage;

	if (stage === 'PROD') {
		const octokit = await stageAwareOctokit(stage);

		const dependabotAlertsEnabledStatusCode: StatusCode =
			await enableDependabotAlerts(repo, octokit);

		const successStatusCode = 204;

		if (dependabotAlertsEnabledStatusCode === successStatusCode) {
			await createPrAndAddToProject(
				stage,
				repo,
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
			throw Error(
				'Unable to enable Dependabot alerts - PR not added to project',
			);
		}
	} else {
		console.log(`Testing generation of ${fileName} for ${repo}`);
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
