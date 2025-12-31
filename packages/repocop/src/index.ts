import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';
import type {
	github_repository_custom_properties,
	guardian_github_actions_usage,
	PrismaClient,
	repocop_github_repository_rules,
	view_repo_ownership,
} from '@prisma/client';
import { awsClientConfig } from 'common/aws.js';
import { getRepoOwnership, getRepositories } from 'common/database-queries.js';
import { partition, stageAwareOctokit } from 'common/functions.js';
import { getPrismaClient } from 'common/src/database-setup.js';
import type { RepocopVulnerability } from 'common/src/types.js';
import type { Config } from './config.js';
import { getConfig } from './config.js';
import {
	evaluateRepositories,
	testExperimentalRepocopFeatures,
} from './evaluation/repository.js';
import { sendToCloudwatch } from './metrics.js';
import {
	getDependabotVulnerabilities,
	getProductionWorkflowUsages,
	getRepositoryBranches,
	getRepositoryCustomProperties,
	getRepositoryLanguages,
	getStacks,
	getTeams,
} from './query.js';
import { applyBranchProtectionAndMessageTeams } from './remediation/branch-protector/branch-protection.js';
import { sendReposToDependencyGraphIntegrator } from './remediation/dependency_graph-integrator/send-to-sns.js';
import { sendPotentialInteractives } from './remediation/topics/topic-monitor-interactive.js';
import { applyProductionTopicAndMessageTeams } from './remediation/topics/topic-monitor-production.js';
import { createAndSendVulnerabilityDigests } from './remediation/vuln-digest/vuln-digest.js';
import type { AwsCloudFormationStack, EvaluationResult } from './types.js';
import { isProduction } from './utils.js';

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
	vulnerabilities: Array<RepocopVulnerability & { repo_owner: string }>,
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

	const teams = await getTeams(prisma);
	const repoOwners = await getRepoOwnership(prisma);

	const productionRepos = unarchivedRepos.filter((repo) => isProduction(repo));
	const productionDependabotVulnerabilities: RepocopVulnerability[] =
		await getDependabotVulnerabilities(
			productionRepos,
			config.gitHubOrg,
			octokit,
		);

	const productionWorkflowUsages: guardian_github_actions_usage[] =
		await getProductionWorkflowUsages(prisma, productionRepos);

	const evaluationResults: EvaluationResult[] = evaluateRepositories(
		unarchivedRepos,
		branches,
		repoOwners,
		repoLanguages,
		productionDependabotVulnerabilities,
		productionWorkflowUsages,
	);

	const repocopRules = evaluationResults.map((r) => r.repocopRules);
	const severityPredicate = (x: RepocopVulnerability) => x.severity === 'high';
	const [high, critical] = partition(
		evaluationResults.flatMap((r) => r.vulnerabilities),
		severityPredicate,
	);

	const highPatchable = high.filter((x) => x.is_patchable).length;
	const criticalPatchable = critical.filter((x) => x.is_patchable).length;

	console.warn(
		`Found ${high.length} out of date high vulnerabilities, of which ${highPatchable} are patchable`,
	);
	console.warn(
		`Found ${critical.length} out of date critical vulnerabilities, of which ${criticalPatchable} are patchable`,
	);

	function combineVulnWithOwners(
		vuln: RepocopVulnerability,
		repoOwners: view_repo_ownership[],
	) {
		const owners = repoOwners.filter(
			(owner) => vuln.full_name === owner.full_repo_name,
		);
		return owners.length > 0
			? owners.map((owner) => ({ ...vuln, repo_owner: owner.github_team_slug }))
			: { ...vuln, repo_owner: 'unknown' };
	}

	/**
	 * Create repocop vulnerabilities and write to repocop_vulnerabilities table
	 */
	const vulnerabilities = evaluationResults
		.flatMap((result) => result.vulnerabilities)
		.flatMap((vuln) => combineVulnWithOwners(vuln, repoOwners));

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

	const customProperties = await getRepositoryCustomProperties(prisma);
	const customPropertiesExemptedFromDepGraphIntegration: github_repository_custom_properties[] =
		customProperties.filter((property) => {
			return (
				property.property_name === 'gu_dependency_graph_integrator_ignore' &&
				property.value.length > 0
			);
		});
	const dependencyGraphIntegratorRepoCount = 5;

	await sendReposToDependencyGraphIntegrator(
		config,
		repoLanguages,
		productionRepos,
		productionWorkflowUsages,
		customPropertiesExemptedFromDepGraphIntegration,
		repoOwners,
		dependencyGraphIntegratorRepoCount,
		octokit,
	);

	await writeEvaluationTable(repocopRules, prisma);
	if (config.enableMessaging) {
		await sendPotentialInteractives(repocopRules, config);

		await applyBranchProtectionAndMessageTeams(
			repocopRules,
			repoOwners,
			config,
			unarchivedRepos,
			octokit,
		);

		await createAndSendVulnerabilityDigests(
			config,
			teams,
			repoOwners,
			evaluationResults,
		);

		await applyProductionTopicAndMessageTeams(
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
