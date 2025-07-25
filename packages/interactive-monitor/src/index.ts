import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import type { SNSHandler } from 'aws-lambda';
import { applyTopics, parseEvent, stageAwareOctokit } from 'common/functions.js';
import type { Octokit } from 'octokit';
import { isAusInteractive } from './aus-interactives.js';
import type { Config } from './config.js';
import { getConfig } from './config.js';
import { isUkInteractive } from './uk-interactives.js';

interface InteractiveRepoAssessment {
	repo: string;
	isInteractive: boolean;
}

async function isInteractive(repo: string, owner: string, octokit: Octokit): Promise<InteractiveRepoAssessment> {
	const result = { repo: repo, isInteractive: isAusInteractive(repo) || (await isUkInteractive(repo, owner, octokit)) };
	console.log(result);
	return result;
}

async function notify(onProd: boolean, interactives: InteractiveRepoAssessment[], config: Config) {
	const client = new Anghammarad();
	const today = new Date().toDateString();
	const msg = `The following repositories have been assessed as interactives:\n${interactives.map((r) => r.repo).join('\n')}`;
	await client.notify({
		subject: 'Interactive Monitor',
		actions: [],
		message: msg,
		target: onProd ? { GithubTeamSlug: 'devx-security' } : { Stack: 'testing-alerts' },
		channel: RequestedChannel.PreferHangouts,
		sourceSystem: `interactive-monitor ${config.stage}`,
		topicArn: config.anghammaradSnsTopic,
		threadKey: `${config.app}-${today}`,
	});
}

export async function assessRepos(events: string[], config: Config) {

	const octokit = await stageAwareOctokit(config.stage);
	const { stage, owner } = config;
	const onProd = stage === 'PROD';
	const results: InteractiveRepoAssessment[] = await Promise.all(events.map(async (repo) => await isInteractive(repo, owner, octokit)));
	const interactives = results.filter((result) => result.isInteractive);
	if (interactives.length > 0) {
		await Promise.all(interactives.map((repo) => applyTopics(repo.repo, owner, octokit, 'interactive')));
		await notify(onProd, interactives, config);
	} else {
		console.log('No interactives found');
	}
}

export const handler: SNSHandler = async (event) => {
	const config = getConfig();
	console.log(`Detected stage: ${config.stage}`);
	const events = parseEvent<string[]>(event).flat();

	await assessRepos(events, config);
};
