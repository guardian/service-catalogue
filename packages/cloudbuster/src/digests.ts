import { RequestedChannel } from '@guardian/anghammarad';
import type { Anghammarad } from '@guardian/anghammarad';
import type { Config } from './config';
import { groupFindingsByAccount } from './findings';
import type { Digest, Finding, GroupedFindings } from './types';

/**
 * Given a list of findings, creates a list of digests ready to be emailed out
 */
export function createDigestsFromFindings(findings: Finding[]): Digest[] {
	const groupedFindings = groupFindingsByAccount(findings);

	return Object.keys(groupedFindings)
		.map((awsAccountId) =>
			createDigestForAccount(awsAccountId, groupedFindings),
		)
		.filter((d): d is Digest => d !== undefined);
}

function createDigestForAccount(
	awsAccountId: string,
	findings: GroupedFindings,
): Digest | undefined {
	const teamFindings = findings[awsAccountId];

	if (!teamFindings || teamFindings.length == 0) {
		return undefined;
	}

	return {
		accountId: awsAccountId,
		subject: `Security Hub vulnerabilities detected in AWS account ${teamFindings[0]?.awsAccountName}`,
		message: createEmailBody(teamFindings),
	};
}

function createEmailBody(findings: Finding[]): string {
	const findingsSortedByPriority = findings.sort(
		(a, b) => (b.priority ?? 0) - (a.priority ?? 0),
	);

	return `The following vulnerabilities have been found in your account:\n 
        ${findingsSortedByPriority
					.map(
						(f) =>
							`[${f.severity}] ${f.title}
Affected resource(s): ${f.resources.join(',')}
Remediation: ${`[Documentation](${f.remediationUrl})`} ?? 'Unknown'}`,
					)
					.join('\n\n')}`;
}

export async function sendDigest(
	anghammaradClient: Anghammarad,
	config: Config,
	digest: Digest,
): Promise<void> {
	console.log(`Sending digest to ${digest.accountId}...`);

	await anghammaradClient.notify({
		subject: digest.subject,
		message: digest.message,
		actions: [
			{
				cta: 'View all findings on Grafana',
				url: 'https://metrics.gutools.co.uk/d/ddi3x35x70jy8d/fsbp-compliance',
			},
		],
		target: { AwsAccount: digest.accountId },
		threadKey: digest.accountId,
		channel: RequestedChannel.HangoutsChat,
		sourceSystem: `cloudbuster ${config.stage}`,
		topicArn: config.anghammaradSnsTopic as string,
	});
}
