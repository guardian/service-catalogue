import type { MetricDatum } from '@aws-sdk/client-cloudwatch';
import {
	CloudWatchClient,
	PutMetricDataCommand,
} from '@aws-sdk/client-cloudwatch';
import type {
	PrismaClient,
	repocop_github_repository_rules,
} from '@prisma/client';
import { awsClientConfig } from 'common/aws';
import { getPrismaClient } from 'common/database';
import { getEnvOrThrow, partition, stageAwareOctokit } from 'common/functions';
import type { Config } from './config';
import { getConfig } from './config';
import {
	getRepoOwnership,
	getRepositories,
	getRepositoryBranches,
	getRepositoryLanguages,
	getSnykProjects,
	getStacks,
	getTeamRepositories,
	getTeams,
	getWorkflowFiles,
} from './query';
import { protectBranches } from './remediations/branch-protector/branch-protection';
import { sendPotentialInteractives } from './remediations/topics/topic-monitor-interactive';
import { applyProductionTopicAndMessageTeams } from './remediations/topics/topic-monitor-production';
import {
	evaluateRepositories,
	testExperimentalRepocopFeatures,
} from './rules/repository';
import type { AwsCloudFormationStack } from './types';

function getPercentageTrue(evaluatedRepos: Array<boolean | undefined>) {
	const totalRepos = evaluatedRepos.length;
	const trackedReposPercentage: number =
		Math.round(evaluatedRepos.filter((x) => x).length / totalRepos) * 100;

	return trackedReposPercentage;
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

async function sendToCloudwatch(
	evaluatedRepos: repocop_github_repository_rules[],
	cloudwatch: CloudWatchClient,
) {
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

async function writeEvaluationTable(
	evaluatedRepos: repocop_github_repository_rules[],
	prisma: PrismaClient,
) {
	console.log('Clearing the table');
	await prisma.repocop_github_repository_rules.deleteMany({});

	console.log(`Writing ${evaluatedRepos.length} records to table`);
	await prisma.repocop_github_repository_rules.createMany({
		data: evaluatedRepos,
	});

	console.log('Finished writing to table');
}

export async function main() {
	const config: Config = await getConfig();
	const prisma = getPrismaClient(config);

	const [unarchivedRepos, archivedRepos] = partition(
		await getRepositories(prisma, config.ignoredRepositoryPrefixes),
		(repo) => !repo.archived,
	);
	const branches = await getRepositoryBranches(prisma, unarchivedRepos);
	const repoTeams = await getTeamRepositories(prisma);
	const repoLanguages = await getRepositoryLanguages(prisma);
	const workflowFiles = await getWorkflowFiles(prisma);
	const nonPlaygroundStacks: AwsCloudFormationStack[] = (
		await getStacks(prisma)
	).filter((s) => s.tags.Stack !== 'playground');
	const snykProjects = await getSnykProjects(prisma);
	const evaluatedRepos: repocop_github_repository_rules[] =
		evaluateRepositories(
			unarchivedRepos,
			branches,
			repoTeams,
			repoLanguages,
			snykProjects,
			workflowFiles,
		);

	const awsConfig = awsClientConfig(config.stage);
	const cloudwatch = new CloudWatchClient(awsConfig);
	await sendToCloudwatch(evaluatedRepos, cloudwatch);

	const octokit = await stageAwareOctokit(config.stage);

	testExperimentalRepocopFeatures(
		evaluatedRepos,
		unarchivedRepos,
		archivedRepos,
		nonPlaygroundStacks,
	);

	await writeEvaluationTable(evaluatedRepos, prisma);
	if (config.enableMessaging) {
		await sendPotentialInteractives(evaluatedRepos, config);

		const repoOwners = await getRepoOwnership(prisma);
		const teams = await getTeams(prisma);

		if (config.branchProtectionEnabled) {
			await protectBranches(
				evaluatedRepos,
				repoOwners,
				teams,
				config,
				unarchivedRepos,
				octokit,
			);
		}
		await applyProductionTopicAndMessageTeams(
			teams,
			unarchivedRepos,
			nonPlaygroundStacks,
			repoOwners,
			octokit,
			config,
		);
	} else {
		console.log(
			'Messaging is not enabled. Set ENABLE_MESSAGING flag to enable.',
		);
	}

	console.log('Done');
}
