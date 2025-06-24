import { RequestedChannel } from '@guardian/anghammarad';
import type { Action, Anghammarad, NotifyParams } from '@guardian/anghammarad';
import type { cloudbuster_fsbp_vulnerabilities } from '@prisma/client';
import { stringToSeverity } from 'common/src/functions';
import { logger } from 'common/src/logs';
import type { SecurityHubSeverity, Severity } from 'common/src/types';
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
	if (aws_account_name && aws_account_id) {
		return {
			accountId: aws_account_id,

			accountName: aws_account_name,
			actions: createCta(aws_account_name),
			subject: `Security Hub findings for AWS account ${aws_account_name}`,
			message: createEmailBody(
				recentFindings,
				vulnCutOffInDays,
				aws_account_name,
				stringToSeverity(finding.severity),
			),
		};
	} else {
		return undefined;
	}
}

function groupByControlIdAndApp(
	findings: cloudbuster_fsbp_vulnerabilities[],
): Record<string, cloudbuster_fsbp_vulnerabilities[]> {
	return findings.reduce<Record<string, cloudbuster_fsbp_vulnerabilities[]>>(
		(acc, f) => {
			const key = `${f.control_id} ${f.app ?? 'unknown-app'}`;
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(f);
			return acc;
		},
		{},
	);
}

function formatFindings(
	key: string,
	account_name: string,
	findings: cloudbuster_fsbp_vulnerabilities[],
) {
	const findingsCount = findings.length;
	const control_id = findings[0]?.control_id;
	const app = findings[0]?.app ?? 'unknown';
	const remediation = findings[0]?.remediation;
	const title = findings[0]?.title;
	const findingsString = findingsCount === 1 ? 'finding' : 'findings';
	const regions = [...new Set(findings.map((f) => f.aws_region))].join(', ');
	const url = `https://metrics.gutools.co.uk/d/ddi3x35x70jy8d?var-account_name=${encodeURIComponent(account_name)}&var-control_id=${control_id}`;
	return `[${findingsCount} ${findingsString}](${url}) in app: **${app}**, for control [${control_id}](${remediation}), in ${regions}, (${title})`;
}

function createEmailBody(
	findings: cloudbuster_fsbp_vulnerabilities[],
	cutOffInDays: number,
	account_name: string,
	severity: Severity,
): string {
	//None of the sublists will ever be empty
	const listOfGroupedFindings = Object.values(
		groupByControlIdAndApp(findings),
	).sort((a, b) => b.length - a.length);

	const msg = listOfGroupedFindings
		.map((list) => {
			const key = `${list[0]?.control_id} ${list[0]?.app ?? 'unknown-app'}`;
			return formatFindings(key, account_name, list);
		})
		.join('\n\n');

	return `The following ${severity} vulnerabilities have been found in your account in the last ${cutOffInDays} days:
	        ${msg}`;
}

export async function sendDigest(
	anghammaradClient: Anghammarad,
	config: Config,
	digest: Digest,
): Promise<void> {
	const notifyParams: NotifyParams = {
		subject: digest.subject,
		message: digest.message,
		actions: digest.actions,
		target: { AwsAccount: digest.accountId },
		threadKey: digest.accountId,
		channel: RequestedChannel.PreferHangouts,
		sourceSystem: `cloudbuster ${config.stage}`,
		topicArn: config.anghammaradSnsTopic,
	};

	const { enableMessaging, stage } = config;

	if (enableMessaging) {
		const notificationParameters =
			stage === 'PROD'
				? notifyParams
				: {
					...notifyParams,
					target: { Stack: 'testing-alerts' },
				};
		logger.log({
			message: `Sending ${digest.accountId} (${digest.accountName}) digest...`,
			accountName: digest.accountName,
			target: notificationParameters.target,
			enableMessaging,
		});

		await anghammaradClient.notify(notificationParameters);
	} else {
		logger.log({
			message: `Messaging disabled. Anghammarad would have sent: ${JSON.stringify(notifyParams, null, 4)}`,
			accountName: digest.accountName,
			target: notifyParams.target,
			enableMessaging,
		});
	}
}
