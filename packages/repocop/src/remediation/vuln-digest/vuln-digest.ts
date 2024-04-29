import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import type { view_repo_ownership } from '@prisma/client';
import type { Config } from '../../config';
import { vulnerabilityExceedsSla } from '../../evaluation/repository';
import {
	type EvaluationResult,
	type RepocopVulnerability,
	SLAs,
	type Team,
	type VulnerabilityDigest,
} from '../../types';
import { vulnSortPredicate } from '../../utils';

function getOwningRepos(
	team: Team,
	repoOwners: view_repo_ownership[],
	results: EvaluationResult[],
) {
	const reposOwnedByTeam = repoOwners.filter(
		(repoOwner) => repoOwner.github_team_id === team.id,
	);

	const resultsOwnedByTeam = reposOwnedByTeam
		.map((repo) => {
			return results.find((result) => result.fullName === repo.full_repo_name);
		})
		.filter((result): result is EvaluationResult => result !== undefined);

	return resultsOwnedByTeam;
}

export function getTopVulns(vulnerabilities: RepocopVulnerability[]) {
	return vulnerabilities
		.sort(vulnSortPredicate)
		.slice(0, 10)
		.sort((v1, v2) => v1.full_name.localeCompare(v2.full_name));
}

export function daysLeftToFix(vuln: RepocopVulnerability): number | undefined {
	const daysToFix = SLAs[vuln.severity];
	if (!daysToFix) {
		return undefined;
	}
	const fixDate = new Date(vuln.alert_issue_date);
	fixDate.setDate(fixDate.getDate() + daysToFix);
	const daysLeftToFix = Math.floor(
		(fixDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
	);

	return daysLeftToFix < 0 ? 0 : daysLeftToFix;
}

function createHumanReadableVulnMessage(vuln: RepocopVulnerability): string {
	const dateString = new Date(vuln.alert_issue_date).toDateString();
	const ecosystem =
		vuln.ecosystem === 'maven' ? 'sbt or maven' : vuln.ecosystem;

	const daysToFix = daysLeftToFix(vuln);

	return String.raw`[${vuln.full_name}](https://github.com/${vuln.full_name}) contains a [${vuln.severity.toUpperCase()} vulnerability](${vuln.urls[0]}).
Introduced via **${vuln.package}** on ${dateString}, from ${ecosystem}. There are ${daysToFix} days left to fix this vulnerability.
This vulnerability ${vuln.is_patchable ? 'is ' : 'may *not* be '}patchable.`;
}

function createTeamDashboardLinkAction(team: Team) {
	return {
		cta: `View vulnerability dashboard for ${team.name} on Grafana`,
		url: `https://metrics.gutools.co.uk/d/fdib3p8l85jwgd?var-repo_owner=${team.slug}`,
	};
}

export function createDigest(
	team: Team,
	repoOwners: view_repo_ownership[],
	results: EvaluationResult[],
): VulnerabilityDigest | undefined {
	const resultsForTeam = getOwningRepos(team, repoOwners, results);
	const vulns = resultsForTeam.flatMap((r) => r.vulnerabilities);

	const recentVulns = vulns.filter(
		(v) => !vulnerabilityExceedsSla(v.alert_issue_date, v.severity),
	);

	const totalNewVulnsCount = recentVulns.length;

	const totalOldVulnsCount = vulns.length - totalNewVulnsCount;

	if (totalNewVulnsCount === 0) {
		return undefined;
	}

	const preamble = String.raw`Found ${totalNewVulnsCount} recently introduced vulnerabilities across ${resultsForTeam.length} repositories.
Obligations to resolve: Critical - ${SLAs.critical} days; High - ${SLAs.high} days.
There are ${totalOldVulnsCount} vulnerabilities exceeding this obligation, please see the dashboard linked for more information.
Note: DevX only aggregates vulnerability information for repositories with a production topic.`;

	const digestString = recentVulns
		.map((v) => createHumanReadableVulnMessage(v))
		.join('\n\n');

	const message = `${preamble}\n\n${digestString}`;
	const actions = [createTeamDashboardLinkAction(team)];

	return {
		teamSlug: team.slug,
		subject: `Vulnerability Digest for ${team.name}`,
		message,
		actions,
	};
}

export function isFirstOrThirdTuesdayOfMonth(date: Date) {
	const isTuesday = date.getDay() === 2;
	const inFirstWeek = date.getDate() <= 7;
	const inThirdWeek = date.getDate() >= 15 && date.getDate() <= 21;
	return isTuesday && (inFirstWeek || inThirdWeek);
}

async function sendVulnerabilityDigests(
	digests: VulnerabilityDigest[],
	config: Config,
) {
	const anghammarad = new Anghammarad();
	console.log(
		`Sending ${digests.length} vulnerability digests: ${digests
			.map((d) => d.teamSlug)
			.join(', ')}`,
	);

	return Promise.all(
		digests.map(
			async (digest) =>
				await anghammarad.notify({
					subject: digest.subject,
					message: digest.message,
					actions: digest.actions,
					target: { GithubTeamSlug: digest.teamSlug },
					channel: RequestedChannel.PreferHangouts,
					sourceSystem: `${config.app} ${config.stage}`,
					topicArn: config.anghammaradSnsTopic,
					threadKey: `vulnerability-digest-${digest.teamSlug}`,
				}),
		),
	);
}

export async function createAndSendVulnerabilityDigests(
	config: Config,
	teams: Team[],
	repoOwners: view_repo_ownership[],
	evaluationResults: EvaluationResult[],
) {
	const digests = teams
		.map((t) => createDigest(t, repoOwners, evaluationResults))
		.filter((d): d is VulnerabilityDigest => d !== undefined);

	console.log('Logging vulnerability digests');
	digests.forEach((digest) => console.log(JSON.stringify(digest)));

	if (isFirstOrThirdTuesdayOfMonth(new Date()) && config.stage === 'PROD') {
		await sendVulnerabilityDigests(digests, config);
	} else {
		console.log('Not sending vulnerability digests');
	}
}
