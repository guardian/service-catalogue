import type {
	github_languages,
	github_repository_branches,
	github_workflows,
	repocop_github_repository_rules,
	snyk_projects,
	snyk_reporting_latest_issues,
} from '@prisma/client';
import type { Octokit } from 'octokit';
import {
	supportedDependabotLanguages,
	supportedSnykLanguages,
} from '../languages';
import type {
	AwsCloudFormationStack,
	DependabotVulnResponse,
	PartialAlert,
	RepoAndAlerts,
	RepoAndStack,
	Repository,
	SnykIssue,
	SnykProject,
	TeamRepository,
} from '../types';

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
function hasAdminTeam(repo: Repository, teams: TeamRepository[]): boolean {
	// Repos that have explicitly been classified as these topics are exempt.
	// Any other repos, regardless of topic, need to be owned by a team, or assigned one of these topics.
	const exemptedTopics = ['prototype', 'learning', 'hackday', 'interactive'];
	const isExempt =
		repo.topics.filter((topic) => exemptedTopics.includes(topic)).length > 0;

	const adminTeams = teams.filter(
		({ id, role_name }) => id === repo.id && role_name === 'admin',
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

interface SnykTags {
	commit?: string;
	branch?: string;
	repo?: string;
}

export function parseSnykTags(snyk_projects: snyk_projects) {
	interface TagValues {
		key: string;
		value: string;
	}

	const tagString = JSON.stringify(snyk_projects.tags);
	const tags = JSON.parse(tagString) as TagValues[];

	const snykTags: SnykTags = {
		commit: tags.find((tag) => tag.key === 'commit')?.value,
		branch: tags.find((tag) => tag.key === 'branch')?.value,
		repo: tags.find((tag) => tag.key === 'repo')?.value,
	};

	return snykTags;
}

/**
 * Evaluate the following rule for a Github repository:
 *   > Repositories should have their dependencies tracked via Snyk or Dependabot, depending on the languages present.
 */
export function hasDependencyTracking(
	repo: Repository,
	repoLanguages: github_languages[],
	snyk_projects: snyk_projects[],
	workflowFiles: github_workflows[],
): boolean {
	if (!repo.topics.includes('production') || repo.archived) {
		return true;
	}

	const languages: string[] =
		repoLanguages.find(
			(repoLanguage) => repoLanguage.full_name === repo.full_name,
		)?.languages ?? [];

	const allProjectTags = snyk_projects.map((project) => parseSnykTags(project));

	//This is a temporary workaround until we get the snyk_projects table back.
	function snykYamlExists(repo: Repository, workflowFiles: github_workflows[]) {
		const result = workflowFiles.find(
			(file) =>
				file.repository_id === repo.id &&
				!!file.path &&
				file.path.includes('snyk'),
		);
		const exists = result !== undefined;
		return exists;
	}

	function snykProjectExists(repo: Repository, allProjectTags: SnykTags[]) {
		const result = allProjectTags.find(
			(tags) =>
				//TODO - this is a close enough match for now, but in the future we should use commit hashes
				//to make sure the projects are in sync
				!!repo.full_name &&
				tags.repo == repo.full_name &&
				tags.branch === repo.default_branch,
		);
		const exists = result !== undefined;
		return exists;
	}

	//Using both for now so we don't have to delete all the dead snyk project matching code to make the linter happy
	const repoIsOnSnyk =
		snykYamlExists(repo, workflowFiles) ||
		snykProjectExists(repo, allProjectTags);

	if (repoIsOnSnyk) {
		const containsOnlySnykSupportedLanguages = languages.every((language) =>
			supportedSnykLanguages.includes(language),
		);
		if (!containsOnlySnykSupportedLanguages) {
			console.log(
				`${repo.name} contains the following languages not supported by Snyk: `,
				languages.filter(
					(language) => !supportedSnykLanguages.includes(language),
				),
			);
		}
		return containsOnlySnykSupportedLanguages;
	} else {
		const containsOnlyDependabotSupportedLanguages = languages.every(
			(language) => supportedDependabotLanguages.includes(language),
		);
		if (!containsOnlyDependabotSupportedLanguages) {
			console.log(
				`${repo.name} contains the following languages not supported by Dependabot: `,
				languages.filter(
					(language) => !supportedDependabotLanguages.includes(language),
				),
			);
		}

		return containsOnlyDependabotSupportedLanguages;
	}
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

export async function getAlertsForRepo(
	octokit: Octokit,
	name: string,
): Promise<PartialAlert[] | undefined> {
	if (name.startsWith('guardian/')) {
		name = name.replace('guardian/', '');
	}

	try {
		const alert: DependabotVulnResponse =
			await octokit.rest.dependabot.listAlertsForRepo({
				owner: 'guardian',
				repo: name,
				per_page: 100,
				severity: 'critical,high',
				state: 'open',
				sort: 'created',
				direction: 'asc', //retrieve oldest vulnerabilities first
			});

		return alert.data as PartialAlert[];
	} catch (error) {
		return undefined;
	}
}

function isOldForSeverity(
	date: Date,
	severity: 'critical' | 'high',
	alert: PartialAlert,
) {
	const alertDate = new Date(alert.created_at);
	return alertDate < date && alert.security_vulnerability.severity === severity;
}

export function hasOldDependabotAlerts(
	alerts: PartialAlert[],
	repo: string,
): boolean {
	const highDayCount = 14;
	const criticalDayCount = 1;

	const highVulnCutOff = new Date();
	highVulnCutOff.setDate(highVulnCutOff.getDate() - highDayCount);
	highVulnCutOff.setHours(0, 0, 0, 0);

	const criticalVulnCutOff = new Date();
	criticalVulnCutOff.setDate(criticalVulnCutOff.getDate() - criticalDayCount);
	criticalVulnCutOff.setHours(0, 0, 0, 0);
	const oldHighAlerts = alerts.filter((alert) =>
		isOldForSeverity(highVulnCutOff, 'high', alert),
	);
	const oldCriticalAlerts = alerts.filter((alert) =>
		isOldForSeverity(criticalVulnCutOff, 'critical', alert),
	);
	if (oldCriticalAlerts.length > 0) {
		console.log(
			`Dependabot - ${repo}: has ${oldCriticalAlerts.length} critical alerts older than ${criticalDayCount} days`,
		);
	}
	if (oldHighAlerts.length > 0) {
		console.log(
			`Dependabot - ${repo}: has ${oldHighAlerts.length} high alerts older than ${highDayCount} weeks`,
		);
	}
	if (oldCriticalAlerts.length === 0 && oldHighAlerts.length === 0) {
		console.log(`Dependabot - ${repo}: has no old alerts`);
	}

	return oldHighAlerts.length > 0 || oldCriticalAlerts.length > 0;
}

function getProjectIssues(
	projectId: string,
	issues: snyk_reporting_latest_issues[],
): snyk_reporting_latest_issues[] {
	return issues.filter((issue) =>
		JSON.stringify(issue.projects).includes(projectId),
	);
}

export function hasOldSnykAlerts(
	repo: Repository,
	snykIssues: snyk_reporting_latest_issues[],
	snykProjects: SnykProject[],
) {
	//find snyk projects that have a tag value matching the full repo name
	const snykProjectIdsForRepo = snykProjects
		.filter((project) => {
			const tagValues = project.attributes.tags.map((tag) => tag.value);
			return tagValues.includes(repo.full_name);
		})
		.map((project) => project.id);

	const repoIssues: snyk_reporting_latest_issues[] = snykProjectIdsForRepo
		.map((projectId) => getProjectIssues(projectId, snykIssues))
		.flat();

	const finalIssues = repoIssues.map(
		(i) => JSON.parse(JSON.stringify(i.issue)) as SnykIssue,
	);

	return finalIssues.length > 0;
}

export function testExperimentalRepocopFeatures(
	evaluatedRepos: repocop_github_repository_rules[],
	unarchivedRepos: Repository[],
	archivedRepos: Repository[],
	nonPlaygroundStacks: AwsCloudFormationStack[],
) {
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

/**
 * Apply rules to a repository as defined in https://github.com/guardian/recommendations/blob/main/best-practices.md.
 */
export function evaluateOneRepo(
	alerts: PartialAlert[] | undefined,
	repo: Repository,
	allBranches: github_repository_branches[],
	teams: TeamRepository[],
	repoLanguages: github_languages[],
	snykProjects: snyk_projects[],
	workflowFiles: github_workflows[],
): repocop_github_repository_rules {
	alerts = undefined;

	return {
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
			snykProjects,
			workflowFiles,
		),
		evaluated_on: new Date(),
	};
}

export function evaluateRepositories(
	alerts: RepoAndAlerts[],
	repositories: Repository[],
	branches: github_repository_branches[],
	teams: TeamRepository[],
	repoLanguages: github_languages[],
	snykProjects: snyk_projects[],
	workflowFiles: github_workflows[],
): repocop_github_repository_rules[] {
	const evaluatedRepos = repositories.map((r) => {
		const teamsForRepo = teams.filter((t) => t.id === r.id);
		const branchesForRepo = branches.filter((b) => b.repository_id === r.id);
		const alertsForRepo = alerts.find((a) => a.shortName === r.name);
		return evaluateOneRepo(
			alertsForRepo?.alerts,
			r,
			branchesForRepo,
			teamsForRepo,
			repoLanguages,
			snykProjects,
			workflowFiles,
		);
	});
	return evaluatedRepos;
}
