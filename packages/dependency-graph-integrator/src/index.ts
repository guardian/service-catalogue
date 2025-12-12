import type { SNSHandler } from 'aws-lambda';
import { parseEvent, stageAwareOctokit } from 'common/functions.js';
import type { DependencyGraphIntegratorEvent } from 'common/src/types.js';
import type { Config } from './config.js';
import { getConfig } from './config.js';
import {
	createYaml,
	depGraphPackageManager,
	generatePrBody,
} from './file-generator.js';
import {
	createPrAndAddToProject,
	generateBranchName,
} from './pull-requests.js';
import { enableDependabotAlerts } from './repo-functions.js';
import type { StatusCode } from './types.js';

export async function main(event: DependencyGraphIntegratorEvent) {
	const language = event.language;
	const name = event.name;
	const admins = event.admins;
	console.log(
		`Generating Dependabot PR for ${name} repo with ${language} language, admins: ${admins.join(', ')}.`,
	);
	const config: Config = getConfig();
	const { stage, gitHubOrg } = config;
	const branch = generateBranchName(
		`${depGraphPackageManager[language]}-dependency-graph`,
	);
	const boardNumber = 110;
	const author = 'gu-dependency-graph-integrator';
	const title = `Submit ${depGraphPackageManager[language]} dependencies to GitHub for vulnerability monitoring`;
	const fileName = `.github/workflows/${depGraphPackageManager[language].toLowerCase()}-dependency-graph.yaml`;
	const commitMessage = `Add ${depGraphPackageManager[language].toLowerCase()}-dependency-graph.yaml`;
	const yamlContents = await createYaml(branch, language);
	const repo = name;
	const prContents = generatePrBody(branch, repo, language);

	if (stage === 'PROD') {
		const octokit = await stageAwareOctokit(stage);

		const dependabotAlertsEnabledStatusCode: StatusCode =
			await enableDependabotAlerts(repo, octokit, gitHubOrg);

		const successStatusCode = 204;

		if (dependabotAlertsEnabledStatusCode === successStatusCode) {
			await createPrAndAddToProject(
				stage,
				repo,
				gitHubOrg,
				author,
				branch,
				title,
				prContents,
				fileName,
				yamlContents,
				commitMessage,
				boardNumber,
				admins,
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

	await main(events[0]!);
};
