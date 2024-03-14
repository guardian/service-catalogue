import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';
import type {
	PrismaClient,
	repocop_github_repository_rules,
} from '@prisma/client';
import { awsClientConfig } from 'common/aws';
import { getPrismaClient } from 'common/database';
import { partition, stageAwareOctokit } from 'common/functions';
import type { Config } from './config';
import { getConfig } from './config';
import {
	evaluateRepositories,
	testExperimentalRepocopFeatures,
} from './evaluation/repository';
import { sendToCloudwatch } from './metrics';
import {
	getProjectsForOrg,
	getRepoOwnership,
	getRepositories,
	getRepositoryBranches,
	getRepositoryLanguages,
	getSnykIssues,
	getSnykOrgs,
	getStacks,
	getTeams,
} from './query';
import { protectBranches } from './remediation/branch-protector/branch-protection';
import { sendUnprotectedRepo } from './remediation/snyk-integrator/send-to-sns';
import { sendPotentialInteractives } from './remediation/topics/topic-monitor-interactive';
import { applyProductionTopicAndMessageTeams } from './remediation/topics/topic-monitor-production';
import { createAndSendVulnerabilityDigests } from './remediation/vuln-digest/vuln-digest';
import type {
	AwsCloudFormationStack,
	EvaluationResult,
	RepocopVulnerability,
} from './types';

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
	const repoLanguages = await getRepositoryLanguages(prisma);
	const nonPlaygroundStacks: AwsCloudFormationStack[] = (
		await getStacks(prisma)
	).filter((s) => s.tags.Stack !== 'playground');
	const snykIssues = await getSnykIssues(prisma);

	console.log(snykIssues[0]);
	const teams = await getTeams(prisma);
	const repoOwners = await getRepoOwnership(prisma);

	const evaluationResults: EvaluationResult[] = await evaluateRepositories(
		unarchivedRepos,
		branches,
		repoOwners,
		repoLanguages,
		latestSnykIssues,
		snykProjectsFromRest,
		octokit,
	);

	const repocopRules = evaluationResults.map((r) => r.repocopRules);
	const severityPredicate = (x: RepocopVulnerability) => x.severity === 'high';
	const [high, critical] = partition(
		evaluationResults.map((r) => r.vulnerabilities).flat(),
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
		evaluationResults,
		unarchivedRepos,
		archivedRepos,
		nonPlaygroundStacks,
	);

	await createAndSendVulnerabilityDigests(
		config,
		teams,
		repoOwners,
		evaluationResults,
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
