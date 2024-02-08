import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';
import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import type {
	PrismaClient,
	repocop_github_repository_rules,
} from '@prisma/client';
import { awsClientConfig } from 'common/aws';
import { getPrismaClient } from 'common/database';
import { partition, shuffle, stageAwareOctokit } from 'common/functions';
import type { Config } from './config';
import { getConfig } from './config';
import { sendToCloudwatch } from './metrics';
import {
	getLatestSnykIssues,
	getProjectsForOrg,
	getRepoOwnership,
	getRepositories,
	getRepositoryBranches,
	getRepositoryLanguages,
	getSnykOrgs,
	getStacks,
	getTeamRepositories,
	getTeams,
} from './query';
import { protectBranches } from './remediations/branch-protector/branch-protection';
import { sendUnprotectedRepo } from './remediations/snyk-integrator/send-to-sns';
import { sendPotentialInteractives } from './remediations/topics/topic-monitor-interactive';
import { applyProductionTopicAndMessageTeams } from './remediations/topics/topic-monitor-production';
import {
	evaluateRepositories,
	testExperimentalRepocopFeatures,
} from './rules/repository';
import type {
	AwsCloudFormationStack,
	EvaluationResult,
	RepocopVulnerability,
	VulnerabilityDigest,
} from './types';
import { createDigest } from './vulnerability-digest';

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

	const snykOrgIds = (await getSnykOrgs(config)).orgs.map((org) => org.id);

	const snykProjectsFromRest = (
		await Promise.all(
			snykOrgIds.map(async (orgId) => await getProjectsForOrg(orgId, config)),
		)
	).flat();

	const prisma = getPrismaClient(config);

	const octokit = await stageAwareOctokit(config.stage);

	const [unarchivedRepos, archivedRepos] = partition(
		await getRepositories(prisma, config.ignoredRepositoryPrefixes),
		(repo) => !repo.archived,
	);
	const branches = await getRepositoryBranches(prisma, unarchivedRepos);
	const repoTeams = await getTeamRepositories(prisma);
	const repoLanguages = await getRepositoryLanguages(prisma);
	const nonPlaygroundStacks: AwsCloudFormationStack[] = (
		await getStacks(prisma)
	).filter((s) => s.tags.Stack !== 'playground');
	const latestSnykIssues = await getLatestSnykIssues(prisma);
	const teams = await getTeams(prisma);
	const repoOwners = await getRepoOwnership(prisma);

	const evaluationResult: EvaluationResult[] = await evaluateRepositories(
		unarchivedRepos,
		branches,
		repoTeams,
		repoLanguages,
		latestSnykIssues,
		snykProjectsFromRest,
		octokit,
	);

	const repocopRules = evaluationResult.map((r) => r.repocopRules);
	const severityPredicate = (x: RepocopVulnerability) => x.severity === 'high';
	const [high, critical] = partition(
		evaluationResult.map((r) => r.vulnerabilities).flat(),
		severityPredicate,
	);

	const highPatchable = high.filter((x) => x.isPatchable).length;
	const criticalPatchable = critical.filter((x) => x.isPatchable).length;

	console.warn(
		`Found ${high.length} out of date high vulnerabilities, of which ${highPatchable} are patchable`,
	);
	console.warn(
		`Found ${critical.length} out of date critical vulnerabilities, of which ${criticalPatchable} are patchable`,
	);

	const awsConfig = awsClientConfig(config.stage);
	const cloudwatch = new CloudWatchClient(awsConfig);
	await sendToCloudwatch(repocopRules, cloudwatch, config);

	testExperimentalRepocopFeatures(
		repocopRules,
		unarchivedRepos,
		archivedRepos,
		nonPlaygroundStacks,
	);

	const someTeams = shuffle(teams).slice(0, 5);

	const digests = shuffle(someTeams)
		.slice(0, 8)
		.map((t) => createDigest(t, repoOwners, evaluationResult))
		.filter((d): d is VulnerabilityDigest => d !== undefined);

	console.log(
		`Sending ${digests.length} vulnerability digests: ${digests.map((d) => d.teamSlug).join(', ')}`,
	);
	const anghammarad = new Anghammarad();
	await Promise.all(
		digests.map(
			async (digest) =>
				await anghammarad.notify({
					subject: digest.subject,
					message: digest.message,
					actions: [],
					target: { Stack: 'testing-alerts' },
					channel: RequestedChannel.PreferHangouts,
					sourceSystem: `${config.app} ${config.stage}`,
					topicArn: config.anghammaradSnsTopic,
					threadKey: `vulnerability-digest-${digest.teamSlug}`,
				}),
		),
	);

	await sendUnprotectedRepo(repocopRules, config, repoLanguages);
	await writeEvaluationTable(repocopRules, prisma);
	if (config.enableMessaging) {
		await sendPotentialInteractives(repocopRules, config);

		if (config.branchProtectionEnabled) {
			await protectBranches(
				repocopRules,
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
