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
	accountId: string,
	findings: GroupedFindings,
): Digest | undefined {
	const teamFindings = findings[accountId];

	if (!teamFindings || teamFindings.length == 0) {
		return undefined;
	}

	const accountName = teamFindings[0]?.awsAccountName as string;

	const actions = [
		{
			cta: `View all ${teamFindings.length} findings on Grafana`,
			url: `https://metrics.gutools.co.uk/d/ddi3x35x70jy8d/fsbp-compliance?var-account_name=${accountName}`,
		},
	];

	const severity = teamFindings[0]?.severity;
	const severityText = severity ? ` (${severity})` : '';

	return {
		accountId,
		accountName,
		actions,
		subject: `Security Hub Digest${severityText} for AWS account ${accountName}`,
		message: createEmailBody(teamFindings),
	};
}

function createEmailBody(findings: Finding[]): string {
	const findingsSortedByPriority = findings.sort(
		(a, b) => (b.priority ?? 0) - (a.priority ?? 0),
	);

	return `The following vulnerabilities have been found in your account:
        ${findingsSortedByPriority
					.map(
						(f) =>
							`**[${f.severity}] ${f.title}**
Affected resource(s): ${f.resources.join(',')}
Remediation: ${f.remediationUrl ? `[Documentation](${f.remediationUrl})` : 'Unknown'}`,
					)
					.join('\n\n')}`;
}

export async function sendDigest(
	anghammaradClient: Anghammarad,
	config: Config,
	digest: Digest,
	numberOfFindings: number,
): Promise<void> {
	console.log(`Sending digest to ${digest.accountId}...`);

	const MAX_FINDINGS = 8;

	const extraText = `Only the first ${MAX_FINDINGS} findings are shown. To see all findings, click the link below.`;

	const message =
		numberOfFindings > MAX_FINDINGS
			? `${digest.message}\n\n${extraText}`
			: digest.message;

	await anghammaradClient.notify({
		subject: digest.subject,
		message,
		actions: digest.actions,
		// target: { AwsAccount: digest.accountId },
		target: { Stack: 'testing-alerts' },
		threadKey: digest.accountId,
		channel: RequestedChannel.HangoutsChat,
		sourceSystem: `cloudbuster ${config.stage}`,
		topicArn: config.anghammaradSnsTopic as string,
	});
}
