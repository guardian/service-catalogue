import {
	type CloudWatchClient,
	type MetricDatum,
	PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import type { repocop_github_repository_rules } from '@prisma/client';
import { getEnvOrThrow } from 'common/src/functions';

export function getPercentageTrue(booleanishArray: Array<boolean | null>) {
	const array = booleanishArray.filter((x) => x !== null) as boolean[];
	if (array.length === 0) {
		return 0;
	}
	const totalRepos = array.length;
	const trackedReposPercentage = (
		(array.filter((x) => x).length * 100) /
		totalRepos
	).toFixed(1);
	return parseFloat(trackedReposPercentage);
}

function createMetric(
	metricName: string,
	boolArray: Array<boolean | null>,
): MetricDatum {
	getPercentageTrue(boolArray);
	const Dimensions = [
		{
			Name: 'Stack',
			Value: getEnvOrThrow('STACK'),
		},
		{
			Name: 'Stage',
			Value: process.env.STAGE ?? 'DEV',
		},
		{
			Name: 'App',
			Value: getEnvOrThrow('APP'),
		},
	];

	return {
		MetricName: metricName,
		Value: getPercentageTrue(boolArray),
		Unit: 'Percent',
		Dimensions,
	};
}

export async function sendToCloudwatch(
	evaluatedRepos: repocop_github_repository_rules[],
	cloudwatch: CloudWatchClient,
) {
	console.log('Sending metrics to Cloudwatch');
	await cloudwatch.send(
		new PutMetricDataCommand({
			Namespace: 'repocop',
			MetricData: [
				createMetric(
					'DefaultBranchIsMain',
					evaluatedRepos.map((x) => x.default_branch_name),
				),
				createMetric(
					'IsMaintained',
					evaluatedRepos.map((x) => x.archiving),
				),
				createMetric(
					'HasAdminTeam',
					evaluatedRepos.map((x) => x.admin_access),
				),
				createMetric(
					'HasVulnerabilityTracking',
					evaluatedRepos.map((x) => x.vulnerability_tracking),
				),
				createMetric(
					'HasValidTopics',
					evaluatedRepos.map((x) => x.topics),
				),
				createMetric(
					'HasBranchProtection',
					evaluatedRepos.map((x) => x.branch_protection),
				),
			],
		}),
	);
}
