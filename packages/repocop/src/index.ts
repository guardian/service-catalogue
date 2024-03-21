import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';
import type {
	PrismaClient,
	repocop_github_repository_rules,
	repocop_vulnerabilities,
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
	getRepoOwnership,
	getRepositories,
	getRepositoryBranches,
	getRepositoryLanguages,
	getSnykIssues,
	getSnykProjects,
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

async function writeVulnerabilitiesTable(
	vulnerabilities: repocop_vulnerabilities[],
	prisma: PrismaClient,
) {
	console.log('Clearing the vulnerabilities table');
	await prisma.repocop_vulnerabilities.deleteMany({});

	console.log(`Writing ${vulnerabilities.length} vulnerabilities to table`);
	await prisma.repocop_vulnerabilities.createMany({
		data: vulnerabilities,
	});

	console.log('Finished writing to vulnerabilities table');
}

export async function main() {
	const config: Config = await getConfig();

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
	const snykProjects = await getSnykProjects(prisma);
	const teams = await getTeams(prisma);
	const repoOwners = await getRepoOwnership(prisma);

	const evaluationResults: EvaluationResult[] = await evaluateRepositories(
		unarchivedRepos,
		branches,
		repoOwners,
		repoLanguages,
		snykIssues,
		snykProjects,
		octokit,
	);

	const repocopRules = evaluationResults.map((r) => r.repocopRules);
	const severityPredicate = (x: RepocopVulnerability) => x.severity === 'high';
	const [high, critical] = partition(
		evaluationResults.flatMap((r) => r.vulnerabilities),
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

	/**
	 * Create repocop vulnerabilities and write to repocop_vulnerabilities table
	 */
	const vulnerabilities: repocop_vulnerabilities[] = evaluationResults
		.map((result) => result.vulnerabilities)
		.flat()
		.map((vuln) => {
			const owners = repoOwners.filter(
				(owner) => vuln.fullName === owner.full_repo_name,
			);
			return owners.length > 0
				? owners.map((owner) => ({
						...vuln,
						repo_owner: owner.github_team_slug,
					}))
				: { ...vuln, repo_owner: 'unknown' };
		})
		.flat() as unknown as repocop_vulnerabilities[];

	await writeVulnerabilitiesTable(vulnerabilities, prisma);

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
