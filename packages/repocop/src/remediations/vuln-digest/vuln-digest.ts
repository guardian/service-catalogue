import type { Action } from '@guardian/anghammarad';
import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import type { view_repo_ownership } from '@prisma/client';
import type { Config } from '../../config';
import type { EvaluationResult, Team, VulnerabilityDigest } from '../../types';
import { createDigest } from '../../vulnerability-digest';

export function isFirstOrThirdTuesdayOfMonth(date: Date) {
	const isTuesday = date.getDay() === 2;
	const inFirstWeek = date.getDate() <= 7;
	const inThirdWeek = date.getDate() >= 15 && date.getDate() <= 21;
	return isTuesday && (inFirstWeek || inThirdWeek);
}

async function sendVulnerabilityDigests(
	digests: VulnerabilityDigest[],
	config: Config,
) {
	const anghammarad = new Anghammarad();
	console.log(
		`Sending ${digests.length} vulnerability digests: ${digests
			.map((d) => d.teamSlug)
			.join(', ')}`,
	);

	const action: Action = {
		cta: "See 'Prioritise the vulnerabilities' of these docs for vulnerability obligations",
		url: 'https://security-hq.gutools.co.uk/documentation/vulnerability-management',
	};
	return Promise.all(
		digests.map(
			async (digest) =>
				await anghammarad.notify({
					subject: digest.subject,
					message: digest.message,
					actions: [action],
					target: { GithubTeamSlug: digest.teamSlug },
					channel: RequestedChannel.PreferHangouts,
					sourceSystem: `${config.app} ${config.stage}`,
					topicArn: config.anghammaradSnsTopic,
					threadKey: `vulnerability-digest-${digest.teamSlug}`,
				}),
		),
	);
}

export async function createAndSendVulnerabilityDigests(
	config: Config,
	teams: Team[],
	repoOwners: view_repo_ownership[],
	evaluationResults: EvaluationResult[],
) {
	const digests = teams
		.map((t) => createDigest(t, repoOwners, evaluationResults))
		.filter((d): d is VulnerabilityDigest => d !== undefined);

	if (isFirstOrThirdTuesdayOfMonth(new Date()) && config.stage === 'PROD') {
		await sendVulnerabilityDigests(digests, config);
	} else {
		console.log('Logging vulnerability digests');
		digests.forEach((digest) => console.log(JSON.stringify(digest)));
	}
}
