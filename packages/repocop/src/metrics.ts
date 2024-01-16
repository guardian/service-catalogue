import {
	type CloudWatchClient,
	type MetricDatum,
	PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import type { repocop_github_repository_rules } from '@prisma/client';
import { getEnvOrThrow } from 'common/src/functions';

export function getPercentageTrue(evaluatedRepos: Array<boolean | undefined>) {
	if (evaluatedRepos.length === 0) {
		return 0;
	}
	const totalRepos = evaluatedRepos.length;
	const trackedReposPercentage = (
		(evaluatedRepos.filter((x) => x === true).length * 100) /
		totalRepos
	).toFixed(1);
	return parseFloat(trackedReposPercentage);
}

function createMetric(
	metricName: string,
	boolArray: Array<boolean | undefined>,
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
			Namespace: 'Repocop',
			MetricData: [
				createMetric(
					'TrackedRepositoriesPercentage',
					evaluatedRepos.map((x) => x.vulnerability_tracking),
				),
				createMetric(
					'ValidTopicsPercentage',
					evaluatedRepos.map((x) => x.topics),
				),
				createMetric(
					'BranchProtectionPercentage',
					evaluatedRepos.map((x) => x.branch_protection),
				),
			],
		}),
	);
}
