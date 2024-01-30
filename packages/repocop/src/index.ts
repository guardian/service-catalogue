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
import { sendToCloudwatch } from './metrics';
import {
	getProjectsForOrg,
	getRepoOwnership,
	getRepositories,
	getRepositoryBranches,
	getRepositoryLanguages,
	getSnykOrgs,
	getSnykProjects,
	getStacks,
	getTeamRepositories,
	getTeams,
	getWorkflowFiles,
} from './query';
import { protectBranches } from './remediations/branch-protector/branch-protection';
import { sendUnprotectedRepo } from './remediations/snyk-integrator/send-to-sns';
import { sendPotentialInteractives } from './remediations/topics/topic-monitor-interactive';
import { applyProductionTopicAndMessageTeams } from './remediations/topics/topic-monitor-production';
import {
	evaluateRepositories,
	getAlertsForRepo,
	hasOldAlerts,
	testExperimentalRepocopFeatures,
} from './rules/repository';
import type {
	AwsCloudFormationStack,
	GuardianSnykTags,
	ProjectTag,
	RepoAndAlerts,
} from './types';
import { isProduction, SetWithContentEquality } from './utils';

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

function toGuardianSnykTags(tags: ProjectTag[]): GuardianSnykTags {
	return {
		repo: tags.find((t) => t.key === 'repo')?.value,
		branch: tags.find((t) => t.key === 'branch')?.value,
	};
}

export async function main() {
	const config: Config = await getConfig();

	const snykOrgIds = (await getSnykOrgs(config)).orgs.map((org) => org.id);

	const allSnykTags = (
		await Promise.all(
			snykOrgIds.map(async (orgId) => await getProjectsForOrg(orgId, config)),
		)
	)
		.flat()
		.map((x) => x.attributes.tags)
		.map(toGuardianSnykTags)
		.filter((x) => !!x.repo && !!x.branch);

	const tagsWithContentEquality = new SetWithContentEquality<GuardianSnykTags>(
		(t) => `${t.repo}-${t.branch}`,
	);

	allSnykTags.forEach((t) => tagsWithContentEquality.add(t));
	const uniqueSnykTags = tagsWithContentEquality.values();

	console.log(uniqueSnykTags.slice(0, 10));
	console.log('Projects found: ', tagsWithContentEquality.values().length);

	const prisma = getPrismaClient(config);

	const octokit = await stageAwareOctokit(config.stage);

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

	const prodRepos = unarchivedRepos.filter((repo) => isProduction(repo));
	const alerts: RepoAndAlerts[] = (
		await Promise.all(
			prodRepos.map(async (repo) => {
				return {
					shortName: repo.full_name,
					alerts: await getAlertsForRepo(octokit, repo.name),
				};
			}),
		)
	).filter((x) => !!x.alerts);

	alerts.forEach((alert) => {
		if (alert.alerts && alert.alerts.length > 0) {
			console.log(
				`Found ${alert.alerts.length} alerts for ${alert.shortName}: `,
			);
			hasOldAlerts(alert.alerts, alert.shortName);
		}
	});

	console.log(`Found ${alerts.length} repos with alerts`);

	const evaluatedRepos: repocop_github_repository_rules[] =
		evaluateRepositories(
			alerts,
			unarchivedRepos,
			branches,
			repoTeams,
			repoLanguages,
			snykProjects,
			workflowFiles,
		);

	const awsConfig = awsClientConfig(config.stage);
	const cloudwatch = new CloudWatchClient(awsConfig);
	await sendToCloudwatch(evaluatedRepos, cloudwatch, config);

	testExperimentalRepocopFeatures(
		evaluatedRepos,
		unarchivedRepos,
		archivedRepos,
		nonPlaygroundStacks,
	);

	const repoOwners = await getRepoOwnership(prisma);
	await sendUnprotectedRepo(evaluatedRepos, config, repoLanguages);
	await writeEvaluationTable(evaluatedRepos, prisma);
	if (config.enableMessaging) {
		await sendPotentialInteractives(evaluatedRepos, config);

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
