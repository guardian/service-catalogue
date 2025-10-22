import type {
	github_languages,
	github_repository_branches,
	guardian_github_actions_usage,
	repocop_github_repository_rules,
	view_repo_ownership,
} from 'common/generated/prisma/client.js';
import { isWithinSlaTime, partition } from 'common/src/functions.js';
import { chooseScope, SLAs } from 'common/src/types.js';
import type {
	DepGraphLanguage,
	RepocopVulnerability,
	Repository,
	Severity,
} from 'common/src/types.js';
import {
	depGraphIntegratorSupportedLanguages,
	supportedDependabotLanguages,
} from '../languages.js';
import { doesRepoHaveDepSubmissionWorkflowForLanguage } from '../remediation/dependency_graph-integrator/send-to-sns.js';
import type {
	Alert,
	AwsCloudFormationStack,
	EvaluationResult,
	RepoAndStack,
} from '../types.js';
import { isProduction, vulnSortPredicate } from '../utils.js';

/**
 * Evaluate the following rule for a Github repository:
 *   > The default branch name should be "main".
 */
function hasDefaultBranchNameMain(repo: Repository): boolean {
	return repo.default_branch === 'main';
}

/**
 * Evaluate the following rule for a Github repository:
 *   > Enable branch protection for the default branch, ensuring changes are reviewed before being deployed.
 */
function hasBranchProtection(
	repo: Repository,
	branches: github_repository_branches[],
): boolean {
	const exempt = !(
		repo.topics.includes('production') || repo.topics.includes('documentation')
	);

	const branch = branches.find(
		(branch) =>
			branch.repository_id === repo.id && branch.name === repo.default_branch,
	);
	if (exempt || branch === undefined) {
		return true;
	} else {
		return branch.protected ?? false;
	}
}

/**
 * Evaluate the following rule for a Github repository:
 *   > Grant at least one GitHub team Admin access - typically, the dev team that own the project.
 *   > Repositories without one of the following topics are exempt: production, testing, documentation.
 */
function hasAdminTeam(repo: Repository, teams: view_repo_ownership[]): boolean {
	// Repos that have explicitly been classified as these topics are exempt.
	// Any other repos, regardless of topic, need to be owned by a team, or assigned one of these topics.
	const exemptedTopics = ['prototype', 'learning', 'hackday', 'interactive'];
	const isExempt =
		repo.topics.filter((topic) => exemptedTopics.includes(topic)).length > 0;

	const adminTeams = teams.filter(
		({ full_repo_name, role_name }) =>
			full_repo_name === repo.full_name && role_name === 'admin',
	);
	const hasAdminTeam = adminTeams.length > 0;

	return isExempt || hasAdminTeam;
}
/**
 * Evaluate the following rule for a Github repository:
 *   > Repositories should have one and only one of the following topics to help understand what is in production.
 *   > Repositories owned only by non-P&E teams are exempt.
 */
function hasStatusTopic(repo: Repository): boolean {
	const validTopics = [
		'prototype',
		'learning',
		'hackday',
		'testing',
		'documentation',
		'production',
		'interactive',
	];

	return (
		repo.topics.filter((topic) => validTopics.includes(topic)).length === 1
	);
}

function mostRecentChange(repo: Repository): Date | undefined {
	const definiteDates: Date[] = [
		repo.created_at,
		repo.updated_at,
		repo.pushed_at,
	].filter((d): d is Date => !!d);

	const sortedDates = definiteDates.sort((a, b) => b.getTime() - a.getTime());
	return sortedDates[0] ?? undefined;
}

function isMaintained(repo: Repository): boolean {
	const update: Date | undefined = mostRecentChange(repo);
	const now = new Date();
	const twoYearsAgo = new Date();
	twoYearsAgo.setFullYear(now.getFullYear() - 2);
	//avoid false positives and use current moment if no dates are available for now
	//a repo always has a created_at date, so this is unlikely to happen unless something is wrong with cloudquery
	const recentlyUpdated = (update ?? new Date()) > twoYearsAgo;
	const isInteractive = repo.topics.includes('interactive');

	return isInteractive || recentlyUpdated;
}

function containsSupportedDepGraphLanguagesWithWorkflows(
	repo: Repository,
	workflowsForRepo: guardian_github_actions_usage[],
	languagesNotNativelySupported: string[],
	languages: string[],
): boolean {
	const remainingLanguagesSupportedByDepGraphIntegrator: string[] =
		languagesNotNativelySupported.filter((language) =>
			depGraphIntegratorSupportedLanguages.includes(language),
		);

	// are all unsupported languages supported by dep graph integrator?
	const allRemainingLanguagesSupportedByDepGraphIntegrator =
		languagesNotNativelySupported.every((language) =>
			depGraphIntegratorSupportedLanguages.includes(language),
		);

	const everyDepGraphSupportedLanguageHasWorkflow =
		remainingLanguagesSupportedByDepGraphIntegrator.every((language) => {
			const repoHasWorkflowForLanguage =
				doesRepoHaveDepSubmissionWorkflowForLanguage(
					repo,
					workflowsForRepo,
					language as DepGraphLanguage,
				);

			if (!repoHasWorkflowForLanguage) {
				console.log(
					`${repo.name} contains ${language} which is supported by Dependency Graph Integrator for Dependabot, but it doesn't have a dependency submission workflow`,
				);
			}

			return repoHasWorkflowForLanguage;
		});

	if (!allRemainingLanguagesSupportedByDepGraphIntegrator) {
		console.log(
			`${repo.name} contains the following languages not supported by Dependabot or Dependency Graph Integrator`,
			languages.filter(
				(language) =>
					!depGraphIntegratorSupportedLanguages.includes(language) &&
					!supportedDependabotLanguages.includes(language),
			),
		);
	}
	return (
		allRemainingLanguagesSupportedByDepGraphIntegrator &&
		everyDepGraphSupportedLanguageHasWorkflow
	);
}

function isSupportedByDependabot(
	repo: Repository,
	languages: string[],
	workflowsForRepo: guardian_github_actions_usage[],
): boolean {
	const languagesNotNativelySupported = languages.filter(
		(language) => !supportedDependabotLanguages.includes(language),
	);

	const containsOnlyNativeOrDepSubmissionWorkflowSupportedLanguages =
		containsSupportedDepGraphLanguagesWithWorkflows(
			repo,
			workflowsForRepo,
			languagesNotNativelySupported,
			languages,
		);

	const containsOnlyDependabotSupportedLanguages = languages.every((language) =>
		supportedDependabotLanguages.includes(language),
	);

	return (
		containsOnlyDependabotSupportedLanguages ||
		containsOnlyNativeOrDepSubmissionWorkflowSupportedLanguages
	);
}

/**
 * Evaluate the following rule for a Github repository:
 *   > Repositories should have their dependencies tracked via Dependabot.
 */
export function hasDependencyTracking(
	repo: Repository,
	repoLanguages: github_languages[],
	workflowsForRepo: guardian_github_actions_usage[],
): boolean {
	if (!repo.topics.includes('production') || repo.archived) {
		return true;
	}
	const languages: string[] =
		repoLanguages.find(
			(repoLanguage) => repoLanguage.full_name === repo.full_name,
		)?.languages ?? [];

	return isSupportedByDependabot(repo, languages, workflowsForRepo);
}

/**
 * Evaluate the following rule for a Github repository:
 *   > Archived repositories should not have corresponding stacks on AWS.
 */
export function findStacks(
	repo: Repository,
	stacks: AwsCloudFormationStack[],
): RepoAndStack {
	const stackMatches = stacks.filter((stack) => {
		return (
			!!stack.stack_name &&
			(stack.tags['gu:repo'] === repo.full_name ||
				stack.stack_name.includes(repo.name))
		);
	});
	const stackNames = stackMatches
		.map((stack) => stack.stack_name)
		.filter((s) => !!s);

	return {
		fullName: repo.full_name,
		stacks: stackNames,
	};
}

function findArchivedReposWithStacks(
	archivedRepositories: Repository[],
	unarchivedRepositories: Repository[],
	stacks: AwsCloudFormationStack[],
) {
	const archivedRepos = archivedRepositories;
	const unarchivedRepos = unarchivedRepositories;

	const stacksWithoutAnUnarchivedRepoMatch: AwsCloudFormationStack[] =
		stacks.filter((stack) =>
			unarchivedRepos.some(
				(repo) => !(repo.full_name === stack.tags['gu:repo']),
			),
		);

	const archivedReposWithPotentialStacks: RepoAndStack[] = archivedRepos
		.map((repo) => findStacks(repo, stacksWithoutAnUnarchivedRepoMatch))
		.filter((result) => result.stacks.length > 0);

	return archivedReposWithPotentialStacks;
}

export function vulnerabilityExceedsSla(date: Date, severity: Severity) {
	const daysToRemediate = SLAs[severity];

	if (daysToRemediate === undefined) {
		return false;
	}

	const cutOffDate = new Date();
	cutOffDate.setDate(cutOffDate.getDate() - daysToRemediate);
	return date < cutOffDate;
}

export function hasOldAlerts(
	alerts: RepocopVulnerability[],
	repo: Repository,
): boolean {
	if (!isProduction(repo)) {
		return false;
	}
	const oldAlerts = alerts.filter((a) =>
		vulnerabilityExceedsSla(new Date(a.alert_issue_date), a.severity),
	);

	if (oldAlerts.length > 0) {
		console.log(
			`${repo.name}: has ${oldAlerts.length} alerts that need addressing`,
		);
		console.debug(oldAlerts);
	}

	return oldAlerts.length > 0;
}

export function testExperimentalRepocopFeatures(
	evaluationResults: EvaluationResult[],
	unarchivedRepos: Repository[],
	archivedRepos: Repository[],
	nonPlaygroundStacks: AwsCloudFormationStack[],
) {
	const evaluatedRepos = evaluationResults.map((r) => r.repocopRules);
	const unmaintinedReposCount = evaluatedRepos.filter(
		(repo) => repo.archiving === false,
	).length;

	console.log(
		`Found ${unmaintinedReposCount} unmaintained repositories of ${unarchivedRepos.length}.`,
	);

	const archivedWithStacks = findArchivedReposWithStacks(
		archivedRepos,
		unarchivedRepos,
		nonPlaygroundStacks,
	);

	console.log(`Found ${archivedWithStacks.length} archived repos with stacks.`);

	console.log(
		'Archived repos with live stacks, first 3 results:',
		archivedWithStacks.slice(0, 3),
	);
}

export function deduplicateVulnerabilitiesByCve(
	vulns: RepocopVulnerability[],
): RepocopVulnerability[] {
	const vulnsWithSortedCVEs = vulns.map((v) => {
		return {
			...v,
			cves: v.cves.sort(),
		};
	});
	const [withCVEs, withoutCVEs] = partition(
		vulnsWithSortedCVEs,
		(v) => v.cves.length > 0,
	);

	//group withCVEs by CVEs
	const dedupedWithCVEs = withCVEs
		.sort(vulnSortPredicate)
		.reduce<Record<string, RepocopVulnerability>>((acc, vuln) => {
			const key = vuln.cves.join(',');
			if (!acc[key]) {
				acc[key] = vuln;
			}
			return acc;
		}, {});

	const dedupedVulns = Object.values(dedupedWithCVEs).concat(withoutCVEs);
	return dedupedVulns;
}

/**
 * Apply rules to a repository as defined in https://github.com/guardian/recommendations/blob/main/best-practices.md.
 */
export function evaluateOneRepo(
	dependabotAlertsForRepo: RepocopVulnerability[] | undefined,
	repo: Repository,
	allBranches: github_repository_branches[],
	teams: view_repo_ownership[],
	repoLanguages: github_languages[],
	workflowsForRepo: guardian_github_actions_usage[],
): EvaluationResult {
	const vulnerabilities = dependabotAlertsForRepo ?? [];
	hasOldAlerts(vulnerabilities, repo);

	const repocopRules: repocop_github_repository_rules = {
		full_name: repo.full_name,
		default_branch_name: hasDefaultBranchNameMain(repo),
		branch_protection: hasBranchProtection(repo, allBranches),
		team_based_access: false,
		admin_access: hasAdminTeam(repo, teams),
		archiving: isMaintained(repo),
		topics: hasStatusTopic(repo),
		contents: null,
		vulnerability_tracking: hasDependencyTracking(
			repo,
			repoLanguages,
			workflowsForRepo,
		),
		evaluated_on: new Date(),
	};

	return {
		fullName: repo.full_name,
		repocopRules,
		vulnerabilities: deduplicateVulnerabilitiesByCve(vulnerabilities),
	};
}

//create a predicate that orders a list of urls by whether they contain github.com first
const urlSortPredicate = (maybeUrl: string) => {
	try {
		const url = new URL(maybeUrl);

		if (url.hostname === 'github.com' && url.pathname.includes('advisories')) {
			return -1;
		}
		return 0;
	} catch {
		console.debug(`Invalid url: ${maybeUrl}`);
		return 0;
	}
};

export function dependabotAlertToRepocopVulnerability(
	fullName: string,
	alert: Alert,
): RepocopVulnerability {
	const CVEs = alert.security_advisory.identifiers
		.filter((i) => i.type === 'CVE')
		.map((i) => i.value);

	const alertIssueDate = new Date(alert.created_at);

	const severity = alert.security_advisory.severity;

	return {
		open: alert.state === 'open',
		full_name: fullName,
		source: 'Dependabot',
		severity,
		package: alert.security_vulnerability.package.name,
		urls: alert.security_advisory.references
			.map((ref) => ref.url)
			.sort(urlSortPredicate),
		ecosystem: alert.security_vulnerability.package.ecosystem,
		alert_issue_date: alertIssueDate,
		is_patchable: !!alert.security_vulnerability.first_patched_version,
		cves: CVEs,
		within_sla: isWithinSlaTime(alertIssueDate, severity),
		scope: chooseScope(alert.dependency.scope),
	};
}

export function evaluateRepositories(
	repositories: Repository[],
	branches: github_repository_branches[],
	owners: view_repo_ownership[],
	repoLanguages: github_languages[],
	dependabotVulnerabilities: RepocopVulnerability[],
	productionWorkflowUsages: guardian_github_actions_usage[],
): Promise<EvaluationResult[]> {
	const evaluatedRepos = repositories.map((r) => {
		const vulnsForRepo = dependabotVulnerabilities.filter(
			(v) => v.full_name === r.full_name,
		);

		const teamsForRepo = owners.filter((o) => o.full_repo_name === r.full_name);
		const branchesForRepo = branches.filter((b) => b.repository_id === r.id);
		const workflowsForRepo = productionWorkflowUsages.filter(
			(repo) => repo.full_name === r.full_name,
		);

		return evaluateOneRepo(
			vulnsForRepo,
			r,
			branchesForRepo,
			teamsForRepo,
			repoLanguages,
			workflowsForRepo,
		);
	});
	return Promise.all(evaluatedRepos);
}
