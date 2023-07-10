import { config } from './config';
import { configureLogging } from './logger';

export const main = async () => {
	const { logLevel, app, stage } = config;

	// Configure the logger first, so any calls to `console.log`, `console.warn` etc. are filtered as necessary.
	configureLogging(logLevel);

	console.log(`Hello from ${app} ${stage}!`);

	console.debug(`Sleeping for 1ms`);
	await new Promise((r) => setTimeout(r, 1));
};
