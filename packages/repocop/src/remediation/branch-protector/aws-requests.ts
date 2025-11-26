import { SNSClient } from '@aws-sdk/client-sns';
import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import { awsClientConfig } from 'common/aws.js';
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
	const snsClient = new SNSClient(awsClientConfig(stage));
	const client = new Anghammarad(snsClient, anghammaradSnsTopic);
	await client.notify({
		subject: `RepoCop branch protections (for GitHub team ${teamSlug})`,
		message:
			`Branch protection via Ruleset has been applied to ${fullRepoName}. ` +
			`See Organization rulesets > Branch protection for details. `,
		actions: branchProtectionCtas(fullRepoName, teamSlug),
		target: { GithubTeamSlug: teamSlug },
		channel: RequestedChannel.PreferHangouts,
		sender: `${app} ${stage}`,
		threadKey: anghammaradThreadKey(fullRepoName),
	});
}
