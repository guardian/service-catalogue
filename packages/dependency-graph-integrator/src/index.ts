import type { SNSHandler } from 'aws-lambda';
import { parseEvent, stageAwareOctokit } from 'common/functions';
import { addPrToProject } from 'common/src/projects-graphql';
import {
	generateBranchName,
	getExistingPullRequest,
} from 'common/src/pull-requests';
import type { DependencyGraphIntegratorEvent } from 'common/src/types';
import type { Config } from './config';
import { getConfig } from './config';
import {
	createDependabotPullRequest,
	createYaml,
	generatePr,
} from './snyk-integrator';

export async function main(event: DependencyGraphIntegratorEvent) {
	console.log(`Generating Dependabot PR for ${event.name}`);
	const config: Config = getConfig();

	const branch = generateBranchName('sbt-dependency-graph');
	if (config.stage === 'PROD') {
		const octokit = await stageAwareOctokit(config.stage);
		const existingPullRequest = await getExistingPullRequest(
			octokit,
			event.name,
			'?????', //TODO - add author
		);

		if (!existingPullRequest) {
			const response = await createDependabotPullRequest(
				octokit,
				event.name,
				branch,
			);
			console.log(
				'Pull request successfully created:',
				response?.data.html_url,
			);
			await addPrToProject(config.stage, event.name, NaN, '??????'); //TODO - add board number and author
			console.log('Updated project board');
		} else {
			console.log(
				`Existing pull request found. Skipping creating a new one.`,
				existingPullRequest.html_url,
			);
		}
	} else {
		console.log('Testing snyk.yml generation');
		console.log(createYaml(branch));
		console.log('Testing PR generation');
		const [head, body] = generatePr(branch);
		console.log('Title:\n', head);
		console.log('Body:\n', body);
	}
	console.log('Done');
}

export const handler: SNSHandler = async (event) => {
	const events = parseEvent<DependencyGraphIntegratorEvent>(event);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we're just testing
	await main(events[0]!);
};
