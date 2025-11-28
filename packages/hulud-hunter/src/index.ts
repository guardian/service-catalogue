import { stageAwareOctokit } from 'packages/common/dist/src/functions.js';
import { type Config, getConfig } from './config.js';
import { searchHuludCommits } from './hulud-hunt.js';

export async function main() {
	const config: Config = getConfig();
	const octokit = await stageAwareOctokit(config.stage);
	await searchHuludCommits(octokit, config);
}
