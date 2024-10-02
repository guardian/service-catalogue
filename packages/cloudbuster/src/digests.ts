import { RequestedChannel } from '@guardian/anghammarad';
import type { Anghammarad, NotifyParams } from '@guardian/anghammarad';
import type { cloudbuster_fsbp_vulnerabilities } from '@prisma/client';
import type { SecurityHubSeverity } from 'common/src/types';
import { type Config } from './config';
import { groupFindingsByAccount } from './findings';
import type { Digest } from './types';

/**
 * Given a list of findings, creates a list of digests ready to be emailed out
 */
export function createDigestsFromFindings( //TODO test me
	findings: cloudbuster_fsbp_vulnerabilities[],
	severity: SecurityHubSeverity,
): Digest[] {
	const filteredFindings = findings.filter((f) => f.severity === severity);

	const groupedFindings = groupFindingsByAccount(filteredFindings);

	return Object.keys(groupedFindings)
		.map((awsAccountId) =>
			createDigestForAccount(groupedFindings[awsAccountId] ?? []),
		)
		.filter((d): d is Digest => d !== undefined);
}

function createDigestForAccount(
	accountFindings: cloudbuster_fsbp_vulnerabilities[],
): Digest | undefined {
	if (accountFindings.length === 0 || !accountFindings[0]) {
		return undefined;
	}

	const [finding] = accountFindings;

	const { aws_account_name, aws_account_id } = finding;

	const actions = [
		{
			cta: `View all ${accountFindings.length} findings on Grafana`,
			url: `https://metrics.gutools.co.uk/d/ddi3x35x70jy8d?var-account_name=${aws_account_name}`,
		},
	];

	return {
		accountId: aws_account_id,
		accountName: aws_account_name as string,
		actions,
		subject: `Security Hub findings for AWS account ${aws_account_name}`,
		message: createEmailBody(accountFindings),
	};
}

function createEmailBody(findings: cloudbuster_fsbp_vulnerabilities[]): string {
	return `The following vulnerabilities have been found in your account:
        ${findings
					.map(
						(f) =>
							`**[${f.severity}] ${f.title}**
Affected resource: ${f.arn}
Remediation: ${f.remediation ? `[Documentation](${f.remediation})` : 'Unknown'}`,
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
