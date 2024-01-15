import { randomBytes } from 'crypto';
import type { SNSHandler } from 'aws-lambda';
import { parseEvent, stageAwareOctokit } from 'common/functions';
import type { Config } from './config';
import { getConfig } from './config';
import {
	createSnykPullRequest,
	createYaml,
} from './remediations/snyk-integrator/snyk-integrator';

export async function main(event: SnykIntegratorEvent) {
	const config: Config = getConfig();

	const octokit = await stageAwareOctokit(config.stage);

	console.log('Testing snyk.yml generation');
	console.log(createYaml(event.languages, 'branch'));

	if (config.stage === 'PROD') {
		console.log('Creating a test Snyk Pull Request against test-repocop-prs');
		const response = await createSnykPullRequest(
			octokit,
			event.name,
			// Introduce a random suffix to allow the same PR to be raised multiple times
			// Useful for testing, but may be less useful in production
			`integrate-snyk-${randomBytes(8).toString('hex')}`,
			event.languages,
		);
		console.log('Pull request successfully created:', response?.data.html_url);
	} else {
		console.log(
			'Skipping creating a test Snyk Pull Request (feature is not enabled)',
		);
	}
	console.log('Done');
}

export interface SnykIntegratorEvent {
	name: string;
	languages: string[];
}

export const handler: SNSHandler = async (event) => {
	console.log('Event received:', event);
	const snykIntegratorEvents = parseEvent<SnykIntegratorEvent>(event);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we're just testing
	await main(snykIntegratorEvents[0]!);
};
