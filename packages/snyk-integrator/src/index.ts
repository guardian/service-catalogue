import { randomBytes } from 'crypto';
import type { SNSHandler } from 'aws-lambda';
import { parseEvent, stageAwareOctokit } from 'common/functions';
import type { SnykIntegratorEvent } from 'common/src/types';
import type { Config } from './config';
import { getConfig } from './config';
import { addPrToProject } from './projects-graphql';
import {
	createSnykPullRequest,
	createYaml,
} from './snyk-integrator/snyk-integrator';

export async function main(event: SnykIntegratorEvent) {
	console.log(`Generating Snyk PR for ${event.name}`);
	const config: Config = getConfig();

	// Introduce a random suffix to allow the same PR to be raised multiple times
	// Useful for testing, but may be less useful in production
	const branch = `integrate-snyk-${randomBytes(8).toString('hex')}`;
	if (config.stage === 'PROD') {
		const octokit = await stageAwareOctokit(config.stage);
		const response = await createSnykPullRequest(
			octokit,
			event.name,
			branch,
			event.languages,
		);
		console.log('Pull request successfully created:', response?.data.html_url);

		await addPrToProject(config.stage, event);
		console.log('Updated project board');
	} else {
		console.log('Testing snyk.yml generation');
		console.log(createYaml(event.languages, branch));
		console.log(
			'Skipping creating a test Snyk Pull Request (feature is not enabled)',
		);
	}
	console.log('Done');
}

export const handler: SNSHandler = async (event) => {
	const snykIntegratorEvents = parseEvent<SnykIntegratorEvent>(event);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we're just testing
	await main(snykIntegratorEvents[0]!);
};
