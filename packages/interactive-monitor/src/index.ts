import type { SNSHandler } from 'aws-lambda';
import { parseEvent } from 'common/functions.js';
import { getConfig } from './config.js';
import { assessRepo } from './uk-interactives.js';


export const handler: SNSHandler = async (event) => {
	const config = getConfig();
	console.log(`Detected stage: ${config.stage}`);
	const events = parseEvent<string[]>(event).flat();

	await Promise.all(events.map(async (repo) => await assessRepo(repo, config)));
};
