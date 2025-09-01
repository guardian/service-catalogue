import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import type { view_repo_ownership } from '@prisma/client';
import { daysLeftToFix } from 'common/src/functions.js';
import { SLAs } from 'common/src/types.js';
import type { RepocopVulnerability } from 'common/src/types.js';
import type { Config } from '../../config.js';
import type { EvaluationResult, Team, VulnerabilityDigest } from '../../types.js';
import { removeRepoOwner } from '../shared-utilities.js';

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

function createHumanReadableVulnMessage(vuln: RepocopVulnerability): string {
	const ecosystem =
		vuln.ecosystem === 'maven' ? 'sbt or maven' : vuln.ecosystem;

	const daysToFix = daysLeftToFix(vuln.alert_issue_date, vuln.severity);

	const vulnHyperlink: string = vuln.urls[0]
		? `[${vuln.package}](${vuln.urls[0]})`
		: vuln.package;

	const cveHyperlink = vuln.cves[0] ?? 'no CVE provided';

	return String.raw`[${removeRepoOwner(vuln.full_name)}](https://github.com/${vuln.full_name}) contains a ${vuln.severity} severity vulnerability, ${cveHyperlink}, from ${vulnHyperlink}, introduced via ${ecosystem}.
There are ${daysToFix} days left to fix this vulnerability. It ${vuln.is_patchable ? 'is ' : 'might not be '}patchable.`;
}

function createTeamDashboardLinkAction(team: Team, vulnCount: number) {
	return {
		cta: `View all ${vulnCount} vulnerabilities on Grafana`,
		url: `https://metrics.gutools.co.uk/d/fdib3p8l85jwgd?var-repo_owner=${team.slug}`,
	};
}

export function createDigestForSeverity(
	team: Team,
	severity: 'critical' | 'high',
	repoOwners: view_repo_ownership[],
	results: EvaluationResult[],
	cutOffInDays: number,
): VulnerabilityDigest | undefined {
	const resultsForTeam: EvaluationResult[] = getOwningRepos(
		team,
		repoOwners,
		results,
	);
	const vulns = resultsForTeam.flatMap((r) => r.vulnerabilities);

	const cutOffDate = new Date();
	cutOffDate.setDate(cutOffDate.getDate() - cutOffInDays);

	const patchableFirst = (a: RepocopVulnerability, b: RepocopVulnerability) => {
		if (a.is_patchable && !b.is_patchable) {
			return -1;
		}
		if (!a.is_patchable && b.is_patchable) {
			return 1;
		}
		return 0;
	};

	const vulnsSinceImplementationDate = vulns
		.filter(
			(v) =>
				v.severity == severity && new Date(v.alert_issue_date) > cutOffDate,
		)
		.sort(patchableFirst);

	const totalNewVulnsCount = vulnsSinceImplementationDate.length;

	if (totalNewVulnsCount === 0) {
		return undefined;
	}

	const preamble = String.raw`Found ${totalNewVulnsCount} ${severity} vulnerabilities introduced in the last ${cutOffInDays} days. Teams have ${SLAs[severity]} days to fix these.
Note: DevX only aggregates vulnerability information for runtime dependencies in repositories with a production topic.`;

	const digestString = vulnsSinceImplementationDate
		.map((v) => createHumanReadableVulnMessage(v))
		.join('\n\n');

	const message = `${preamble}\n\n${digestString}`;
	const actions = [createTeamDashboardLinkAction(team, vulns.length)];

	return {
		teamSlug: team.slug,
		subject: `Vulnerability Digest for ${team.name}`,
		message,
		actions,
	};
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

export async function createAndSendVulnDigestsForSeverity(
	config: Config,
	teams: Team[],
	repoOwners: view_repo_ownership[],
	results: EvaluationResult[],
	severity: 'critical' | 'high',
) {
	const digests = teams
		.map((t) =>
			createDigestForSeverity(
				t,
				severity,
				repoOwners,
				results,
				config.cutOffInDays,
			),
		)
		.filter((d): d is VulnerabilityDigest => d !== undefined);

	console.log(`Logging ${severity} vulnerability digests`);
	digests.forEach((digest) => console.log(JSON.stringify(digest)));
	if (config.stage === 'PROD') {
		await sendVulnerabilityDigests(digests, config);
	}
}

export async function createAndSendVulnerabilityDigests(
	config: Config,
	teams: Team[],
	repoOwners: view_repo_ownership[],
	evaluationResults: EvaluationResult[],
) {
	await createAndSendVulnDigestsForSeverity(
		config,
		teams,
		repoOwners,
		evaluationResults,
		'critical',
	);

	const isTuesday = new Date().getDay() === 2;
	if (isTuesday) {
		await createAndSendVulnDigestsForSeverity(
			config,
			teams,
			repoOwners,
			evaluationResults,
			'high',
		);
	}
}
