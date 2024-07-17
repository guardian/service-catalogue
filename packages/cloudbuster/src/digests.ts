import { RequestedChannel } from '@guardian/anghammarad';
import type { Anghammarad, NotifyParams } from '@guardian/anghammarad';
import { type Config } from './config';
import { groupFindingsByAccount } from './findings';
import type { Digest, Finding } from './types';

/**
 * Given a list of findings, creates a list of digests ready to be emailed out
 */
export function createDigestsFromFindings(findings: Finding[]): Digest[] {
	const groupedFindings = groupFindingsByAccount(findings);

	return Object.keys(groupedFindings)
		.map((awsAccountId) =>
			createDigestForAccount(groupedFindings[awsAccountId] ?? []),
		)
		.filter((d): d is Digest => d !== undefined);
}

function createDigestForAccount(
	accountFindings: Finding[],
): Digest | undefined {
	if (accountFindings.length === 0 || !accountFindings[0]) {
		return undefined;
	}

	const [finding] = accountFindings;

	const { awsAccountName, awsAccountId } = finding;

	const actions = [
		{
			cta: `View all ${accountFindings.length} findings on Grafana`,
			url: `https://metrics.gutools.co.uk/d/ddi3x35x70jy8d?var-account_name=${awsAccountName}`,
		},
	];

	return {
		accountId: awsAccountId,
		accountName: awsAccountName as string,
		actions,
		subject: `Security Hub findings for AWS account ${awsAccountName}`,
		message: createEmailBody(accountFindings),
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
): Promise<void> {
	// TODO replace this with `{ AwsAccount: digest.accountId }` to send real alerts
	const target = { Stack: 'testing-alerts' };

	const notifyParams: NotifyParams = {
		subject: digest.subject,
		message: digest.message,
		actions: digest.actions,
		target,
		threadKey: digest.accountId,
		channel: RequestedChannel.HangoutsChat,
		sourceSystem: `cloudbuster ${config.stage}`,
		topicArn: config.anghammaradSnsTopic as string,
	};

	if (config.enableMessaging) {
		console.log(
			`Sending ${digest.accountId} digest to ${JSON.stringify(target, null, 4)}...`,
		);
		await anghammaradClient.notify(notifyParams);
	} else {
		console.log(
			`Messaging disabled. Anghammarad would have sent: ${JSON.stringify(notifyParams, null, 4)}`,
		);
	}
}
