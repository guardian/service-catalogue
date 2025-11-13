import { SNSClient } from '@aws-sdk/client-sns';
import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import type { SNSHandler } from 'aws-lambda';
import { awsClientConfig } from 'common/aws.js';
import {
	applyTopics,
	parseEvent,
	stageAwareOctokit,
} from 'common/functions.js';
import type { Octokit } from 'octokit';
import { isAusInteractive } from './aus-interactives.js';
import type { Config } from './config.js';
import { getConfig } from './config.js';
import { isUkInteractive } from './uk-interactives.js';

interface InteractiveRepoAssessment {
	repo: string;
	isInteractive: boolean;
}

async function isInteractive(
	repo: string,
	owner: string,
	octokit: Octokit,
): Promise<InteractiveRepoAssessment> {
	const result = {
		repo: repo,
		isInteractive:
			isAusInteractive(repo) || (await isUkInteractive(repo, owner, octokit)),
	};
	console.log(result);
	return result;
}

async function notify(
	onProd: boolean,
	interactives: InteractiveRepoAssessment[],
	config: Config,
) {
	const snsClient = new SNSClient(awsClientConfig(config.stage));
	const client = new Anghammarad(snsClient, config.anghammaradSnsTopic);
	const today = new Date().toDateString();
	const message = `The following repositories have been assessed as interactives:\n${interactives.map((r) => `[${r.repo}](https://github.com/${config.owner}/${r.repo})`).join('\n')}`;
	await client.notify({
		subject: 'Interactive Monitor',
		actions: [],
		message,
		target: onProd
			? { GithubTeamSlug: 'devx-security' }
			: { Stack: 'testing-alerts' },
		channel: RequestedChannel.PreferHangouts,
		sender: `interactive-monitor ${config.stage}`,
		threadKey: `${config.app}-${today}`,
	});
}

export async function assessRepos(events: string[], config: Config) {
	const octokit = await stageAwareOctokit(config.stage);
	const { stage, owner } = config;
	const onProd = stage === 'PROD';
	const results: InteractiveRepoAssessment[] = await Promise.all(
		events.map(async (repo) => await isInteractive(repo, owner, octokit)),
	);
	const interactives = results.filter((result) => result.isInteractive);

	if (interactives.length > 0) {
		await notify(onProd, interactives, config);
		if (onProd) {
			await Promise.all(
				interactives.map((repo) =>
					applyTopics(repo.repo, owner, octokit, 'interactive'),
				),
			);
		}
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
