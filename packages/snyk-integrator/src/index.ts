import { randomBytes } from 'crypto';
import { stageAwareOctokit } from 'common/functions';
import type { Config } from './config';
import { getConfig } from './config';
import {
	createSnykPullRequest,
	createYaml,
} from './remediations/snyk-integrator/snyk-integrator';

export async function main() {
	const config: Config = getConfig();

	const octokit = await stageAwareOctokit(config.stage);

	console.log('Testing snyk.yml generation');
	console.log(createYaml(['Scala', 'Python', 'Shell'], 'branch'));
	console.log(createYaml(['Go', 'Dockerfile', 'TypeScript'], 'branch'));

	if (config.stage === 'PROD') {
		console.log('Creating a test Snyk Pull Request against test-repocop-prs');
		const response = await createSnykPullRequest(
			octokit,
			'test-repocop-prs',
			// Introduce a random suffix to allow the same PR to be raised multiple times
			// Useful for testing, but may be less useful in production
			`integrate-snyk-${randomBytes(8).toString('hex')}`,
			['Scala', 'Python', 'Shell'],
		);
		console.log('Pull request successfully created:', response?.data.html_url);
	} else {
		console.log(
			'Skipping creating a test Snyk Pull Request (feature is not enabled)',
		);
	}
	console.log('Done');
}
