import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import {
	anghammaradThreadKey,
	branchProtectionCtas,
} from 'common/src/functions.js';
import type { Config } from '../../config.js';

export async function notify(
	fullRepoName: string,
	config: Config,
	teamSlug: string,
) {
	const { app, stage, anghammaradSnsTopic } = config;
	const client = new Anghammarad();
	await client.notify({
		subject: `RepoCop branch protections (for GitHub team ${teamSlug})`,
		message:
			`Branch protections have been applied to ${fullRepoName}. ` +
			`CI checks and at least one approval will now be required before merging to the default branch.`,
		actions: branchProtectionCtas(fullRepoName, teamSlug),
		target: { GithubTeamSlug: teamSlug },
		channel: RequestedChannel.PreferHangouts,
		sourceSystem: `${app} ${stage}`,
		topicArn: anghammaradSnsTopic,
		threadKey: anghammaradThreadKey(fullRepoName),
	});
}
