import {
	type CloudWatchClient,
	type MetricDatum,
	PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import type { repocop_github_repository_rules } from 'common/generated/prisma/client.js';
import type { Config } from './config.js';

export function getPercentageTrue(booleanishArray: Array<boolean | null>) {
	const array = booleanishArray.filter((x): x is boolean => x !== null);
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
	config: Config,
): MetricDatum {
	getPercentageTrue(boolArray);
	const Dimensions = [
		{
			Name: 'Stack',
			Value: config.stack,
		},
		{
			Name: 'Stage',
			Value: config.stage,
		},
		{
			Name: 'App',
			Value: config.app,
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
	config: Config,
) {
	console.log('Sending metrics to Cloudwatch');
	await cloudwatch.send(
		new PutMetricDataCommand({
			Namespace: 'repocop',
			MetricData: [
				createMetric(
					'DefaultBranchIsMain',
					evaluatedRepos.map((x) => x.default_branch_name),
					config,
				),
				createMetric(
					'IsMaintained',
					evaluatedRepos.map((x) => x.archiving),
					config,
				),
				createMetric(
					'HasAdminTeam',
					evaluatedRepos.map((x) => x.admin_access),
					config,
				),
				createMetric(
					'HasVulnerabilityTracking',
					evaluatedRepos.map((x) => x.vulnerability_tracking),
					config,
				),
				createMetric(
					'HasValidTopics',
					evaluatedRepos.map((x) => x.topics),
					config,
				),
				createMetric(
					'HasBranchProtection',
					evaluatedRepos.map((x) => x.branch_protection),
					config,
				),
			],
		}),
	);
}
