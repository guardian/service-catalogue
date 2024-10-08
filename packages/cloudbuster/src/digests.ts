import { RequestedChannel } from '@guardian/anghammarad';
import type { Action, Anghammarad, NotifyParams } from '@guardian/anghammarad';
import type { cloudbuster_fsbp_vulnerabilities } from '@prisma/client';
import type { SecurityHubSeverity } from 'common/src/types';
import { type Config } from './config';
import { groupFindingsByAccount } from './findings';
import type { Digest } from './types';

/**
 * Given a list of findings, creates a list of digests ready to be emailed out
 */
export function createDigestsFromFindings(
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

function createCta(aws_account_name: string): Action[] {
	if (!aws_account_name) {
		return [];
	} else {
		return [
			{
				cta: `View all findings on Grafana`,
				url: `https://metrics.gutools.co.uk/d/ddi3x35x70jy8d?var-account_name=${encodeURIComponent(aws_account_name)}`,
			},
		];
	}
}

export function createDigestForAccount(
	accountFindings: cloudbuster_fsbp_vulnerabilities[],
): Digest | undefined {
	const vulnCutOffInDays = 60;

	const cutOffDate = new Date();
	cutOffDate.setDate(cutOffDate.getDate() - vulnCutOffInDays);
	const recentFindings = accountFindings.filter(
		(f) => f.first_observed_at && f.first_observed_at > cutOffDate,
	);

	if (recentFindings.length === 0 || !recentFindings[0]) {
		return undefined;
	}

	const [finding] = recentFindings;

	const { aws_account_name, aws_account_id } = finding;
	if (aws_account_name) {
		return {
			accountId: aws_account_id,

			accountName: aws_account_name,
			actions: createCta(aws_account_name),
			subject: `Security Hub findings for AWS account ${aws_account_name}`,
			message: createEmailBody(recentFindings, vulnCutOffInDays),
		};
	} else {
		return undefined;
	}
}

function createEmailBody(
	findings: cloudbuster_fsbp_vulnerabilities[],
	cutOffInDays: number,
): string {
	return `The following vulnerabilities have been found in your account in the last ${cutOffInDays} days:
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
	const target = { Stack: 'testing-alerts' };

	const notifyParams: NotifyParams = {
		subject: digest.subject,
		message: digest.message,
		actions: digest.actions,
		target: { AwsAccount: digest.accountId },
		threadKey: digest.accountId,
		channel: RequestedChannel.HangoutsChat,
		sourceSystem: `cloudbuster ${config.stage}`,
		topicArn: config.anghammaradSnsTopic,
	};

	const { enableMessaging, stage } = config;

	if (enableMessaging && stage == 'PROD') {
		console.log(
			`Sending ${digest.accountId} digest to ${JSON.stringify(target, null, 4)}...`,
		);
		await anghammaradClient.notify(notifyParams);
	} else if (enableMessaging) {
		const testNotifyParams = {
			...notifyParams,
			target: { Stack: 'testing-alerts' },
		};

		console.log(
			`Sending ${digest.accountId} digest to ${JSON.stringify(target, null, 4)}...`,
		);

		await anghammaradClient.notify(testNotifyParams);
	} else {
		console.log(
			`Messaging disabled. Anghammarad would have sent: ${JSON.stringify(notifyParams, null, 4)}`,
		);
	}
}
