import type { SNSHandler } from 'aws-lambda';
import { applyTopics, parseEvent, stageAwareOctokit } from 'common/functions.js';
import { isAusInteractive } from './aus-interactives.js';
import type { Config } from './config.js';
import { getConfig } from './config.js';
import { isUkInteractive } from './uk-interactives.js';

export async function assessRepo(repo: string, config: Config) {
	const octokit = await stageAwareOctokit(config.stage);
	const { stage, owner } = config;
	const onProd = stage === 'PROD';

	const isInteractive = isAusInteractive(repo) || (await isUkInteractive(repo, owner, octokit));

	if (isInteractive && onProd) {
		await applyTopics(repo, owner, octokit, 'interactive');
	}
	else if (!onProd) {
		console.log(`Skipping topic application for ${repo} on ${stage}.`);
	}
	else {
		console.log(`No action taken for ${repo}.`);
	}
}

export const handler: SNSHandler = async (event) => {
	const config = getConfig();
	console.log(`Detected stage: ${config.stage}`);
	const events = parseEvent<string[]>(event).flat();

	await Promise.all(events.map(async (repo) => await assessRepo(repo, config)));
};
