import { SNSClient } from '@aws-sdk/client-sns';
import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import { awsClientConfig } from 'common/aws.js';
import type { view_repo_ownership } from 'common/prisma-client/client.js';
import { daysLeftToFix } from 'common/src/functions.js';
import { generalSLAs } from 'common/src/types.js';
import type {
	AlertType,
	DigestType,
	RepocopVulnerability,
} from 'common/src/types.js';
import type { Config } from '../../config.js';
import type {
	EvaluationResult,
	Team,
	VulnerabilityDigest,
} from '../../types.js';
import { removeRepoOwner } from '../shared-utilities.js';

// A group of vulnerabilities affecting the same package, in the same repo,
// with the same patchable status. `representative` is the vulnerability
// within the group with the soonest fix deadline, and is used to drive the
// "days left to fix" figure and priority sorting for the group as a whole.
export interface VulnerabilityGroup {
	fullName: string;
	package: string;
	isPatchable: boolean;
	vulnerabilities: RepocopVulnerability[];
	representative: RepocopVulnerability;
}

function groupKey(vuln: RepocopVulnerability): string {
	return `${vuln.full_name}::${vuln.package}::${String(vuln.is_patchable)}`;
}

// daysLeftToFix is nullable in principle (its type permits undefined), but in
// practice every vulnerability we handle here always has a computable value.
// Falling back to 0 is a defensive default that should never be hit.
function pickSoonestToExpire(
	vulns: RepocopVulnerability[],
	alertType: AlertType,
): RepocopVulnerability {
	return vulns.reduce((soonest, vuln) => {
		const soonestDays =
			daysLeftToFix(soonest.alert_issue_date, soonest.severity, alertType) ?? 0;
		const vulnDays =
			daysLeftToFix(vuln.alert_issue_date, vuln.severity, alertType) ?? 0;
		return vulnDays < soonestDays ? vuln : soonest;
	});
}

// Consolidates vulnerabilities into one group per package, per repo, per
// patchable status, so that a digest can contain a single message per
// library rather than one message per CVE.
export function groupVulnerabilitiesByPackage(
	vulns: RepocopVulnerability[],
	alertType: AlertType = 'general',
): VulnerabilityGroup[] {
	const groupedByKey = new Map<string, RepocopVulnerability[]>();

	for (const vuln of vulns) {
		const key = groupKey(vuln);
		const existing = groupedByKey.get(key);
		if (existing) {
			existing.push(vuln);
		} else {
			groupedByKey.set(key, [vuln]);
		}
	}

	return Array.from(groupedByKey.values()).map((groupVulns) => {
		const representative = pickSoonestToExpire(groupVulns, alertType);
		return {
			fullName: representative.full_name,
			package: representative.package,
			isPatchable: representative.is_patchable,
			vulnerabilities: groupVulns,
			representative,
		};
	});
}

function getOwningRepos(
	team: Team,
	repoOwners: view_repo_ownership[],
	results: EvaluationResult[],
) {
	const resultsByFullName = new Map(
		results.map((result) => [result.fullName, result]),
	);

	const reposOwnedByTeam = repoOwners.filter(
		(repoOwner) => repoOwner.github_team_id === team.id,
	);

	const resultsOwnedByTeam = reposOwnedByTeam
		.map((repoOwner) => resultsByFullName.get(repoOwner.full_repo_name))
		.filter((result): result is EvaluationResult => result !== undefined);

	return resultsOwnedByTeam;
}

function createHumanReadableMessage(
	group: VulnerabilityGroup,
	alertType: AlertType = 'general',
): string {
	const representative = group.representative;

	const ecosystem =
		representative.ecosystem === 'maven'
			? 'sbt or maven'
			: representative.ecosystem;

	const daysToFix = daysLeftToFix(
		representative.alert_issue_date,
		representative.severity,
		alertType,
	);

	const vulnHyperlink: string = representative.urls[0]
		? `[${group.package}](${representative.urls[0]})`
		: group.package;

	const cves = group.vulnerabilities.flatMap((vuln) => vuln.cves);
	const cveText = cves.length > 0 ? cves.join(', ') : 'no CVE provided';

	const vulnCount = group.vulnerabilities.length;
	const vulnerabilityDescription =
		vulnCount === 1
			? `a ${representative.severity} severity vulnerability`
			: `${vulnCount} ${representative.severity} severity vulnerabilities`;

	return String.raw`[${removeRepoOwner(group.fullName)}](https://github.com/${group.fullName}) ${alertType === 'general' ? `contains ${vulnerabilityDescription}` : 'contains malware'}, ${cveText}, from ${vulnHyperlink}${alertType === 'general' ? `, introduced via ${ecosystem}` : ''}. There are ${daysToFix} days left to ${alertType === 'general' ? 'fix this vulnerability' : 'resolve this malware alert'}. It ${group.isPatchable ? 'is ' : 'might not be '}patchable.`;
}

function createTeamDashboardLinkAction(
	team: Team,
	vulnCount: number,
	alertType: AlertType,
) {
	return alertType === 'general'
		? {
				cta: `View all ${vulnCount} vulnerabilities on Grafana`,
				url: `https://metrics.gutools.co.uk/d/fdib3p8l85jwgd?var-REPO_OWNER=${team.slug}&var-SCOPE=runtime`,
			}
		: {
				cta: `View all ${vulnCount} malware alerts on Grafana`,
				url: `https://metrics.gutools.co.uk/d/fdib3p8l85jwgd?var-REPO_OWNER=${team.slug}&var-SCOPE=All`,
			};
}

const patchableFirstThenWithinSLAThenDate = (
	a: RepocopVulnerability,
	b: RepocopVulnerability,
) => {
	// Can we patch?  Move it up.
	if (a.is_patchable && !b.is_patchable) {
		return -1;
	}
	if (!a.is_patchable && b.is_patchable) {
		return 1;
	}

	// Is it outside SLA?  Move it up.
	if (!a.within_sla && b.within_sla) {
		return -1;
	}
	if (a.within_sla && !b.within_sla) {
		return 1;
	}

	// Is it older?  Move it up.
	if (a.alert_issue_date < b.alert_issue_date) {
		return -1;
	}
	if (a.alert_issue_date > b.alert_issue_date) {
		return 1;
	}

	return 0;
};

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
	const vulns = resultsForTeam
		.flatMap((r) => r.vulnerabilities)
		.filter((vuln) => vuln.alert_type === 'general');

	const cutOffDate = new Date();
	cutOffDate.setDate(cutOffDate.getDate() - cutOffInDays);

	const vulnsSinceImplementationDate = vulns.filter(
		(v) => v.severity == severity && new Date(v.alert_issue_date) > cutOffDate,
	);

	const totalNewVulnsCount = vulnsSinceImplementationDate.length;

	if (totalNewVulnsCount === 0) {
		return undefined;
	}

	const preamble = String.raw`Found ${totalNewVulnsCount} ${severity} vulnerabilities introduced in the last ${cutOffInDays} days. Teams have ${generalSLAs[severity]} days to fix these.
Note: DevX only aggregates vulnerability information for runtime dependencies in repositories with a production topic.`;

	const groups = groupVulnerabilitiesByPackage(
		vulnsSinceImplementationDate,
		'general',
	).sort((a, b) =>
		patchableFirstThenWithinSLAThenDate(a.representative, b.representative),
	);

	const topGroups = groups.slice(0, 20);
	const remainingGroups = groups.length - topGroups.length;

	const vulnMessages = topGroups.map((g) => createHumanReadableMessage(g));
	const andOthersMessage =
		remainingGroups > 0
			? [`… and others. See the full list on Grafana using the link below.`]
			: [];

	const digestString = [...vulnMessages, ...andOthersMessage].join('\n\n');

	const message = `${preamble}\n\n${digestString}`;
	const actions = [
		createTeamDashboardLinkAction(team, vulns.length, 'general'),
	];

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
	digestType: DigestType,
) {
	const snsClient = new SNSClient(awsClientConfig(config.stage));
	const anghammarad = new Anghammarad(snsClient, config.anghammaradSnsTopic);
	console.log(
		`Sending ${digests.length} ${digestType} digests: ${digests
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
					sender: `${config.app} ${config.stage}`,
					threadKey: `${digestType}-digest-${digest.teamSlug}`,
				}),
		),
	);
}

export async function createAndSendVulnDigestsForSeverity(
	config: Config,
	teams: Team[],
	repoOwners: view_repo_ownership[],
	generalResults: EvaluationResult[],
	severity: 'critical' | 'high',
) {
	const digests = teams
		.map((t) =>
			createDigestForSeverity(
				t,
				severity,
				repoOwners,
				generalResults,
				config.cutOffInDays,
			),
		)
		.filter((d): d is VulnerabilityDigest => d !== undefined);

	console.log(`Logging ${severity} vulnerability digests`);
	digests.forEach((digest) => console.log(JSON.stringify(digest)));
	if (config.stage === 'PROD') {
		await sendVulnerabilityDigests(digests, config, 'vulnerability');
	}
}

// Remove non-runtime vulnerabilities from the results
// If there are no runtime vulnerabilities for a repo, remove it from the results
export function removeNonRuntimeVulns(
	results: EvaluationResult[],
): EvaluationResult[] {
	return results
		.map((result) => {
			const runtimeVulns = result.vulnerabilities.filter(
				(vuln) => vuln.scope === 'runtime',
			);
			return { ...result, vulnerabilities: runtimeVulns };
		})
		.filter((result) => result.vulnerabilities.length > 0);
}

export async function createAndSendVulnerabilityDigests(
	config: Config,
	teams: Team[],
	repoOwners: view_repo_ownership[],
	generalResults: EvaluationResult[],
) {
	const runtimeGeneralResults = removeNonRuntimeVulns(generalResults);

	await createAndSendVulnDigestsForSeverity(
		config,
		teams,
		repoOwners,
		runtimeGeneralResults,
		'critical',
	);

	const isTuesday = new Date().getDay() === 2;
	if (isTuesday) {
		await createAndSendVulnDigestsForSeverity(
			config,
			teams,
			repoOwners,
			runtimeGeneralResults,
			'high',
		);
	}
}

export function createMalwareDigest(
	team: Team,
	repoOwners: view_repo_ownership[],
	results: EvaluationResult[],
	cutOffInDays: number,
): VulnerabilityDigest | undefined {
	const resultsForTeam: EvaluationResult[] = getOwningRepos(
		team,
		repoOwners,
		results,
	);
	const malwareAlerts = resultsForTeam
		.flatMap((r) => r.vulnerabilities)
		.filter((vuln) => vuln.alert_type === 'malware');

	const cutOffDate = new Date();
	cutOffDate.setDate(cutOffDate.getDate() - cutOffInDays);

	const malwareSinceImplementationDate = malwareAlerts.filter(
		(a) => new Date(a.alert_issue_date) > cutOffDate,
	);

	const totalNewMalwareCount = malwareSinceImplementationDate.length;

	if (totalNewMalwareCount === 0) {
		return undefined;
	}

	const preamble = String.raw`Found ${totalNewMalwareCount} malware alerts introduced in the last ${cutOffInDays} days. Please address within 1 working day.
Note: Malware information provided is only for repositories with a production topic. Currently the only ecosystem supported by Dependabot is npm.`;

	const groups = groupVulnerabilitiesByPackage(
		malwareSinceImplementationDate,
		'malware',
	).sort((a, b) =>
		patchableFirstThenWithinSLAThenDate(a.representative, b.representative),
	);

	const digestString = groups
		.map((group) => createHumanReadableMessage(group, 'malware'))
		.join('\n\n');

	const message = `${preamble}\n\n${digestString}`;
	const actions = [
		createTeamDashboardLinkAction(team, malwareAlerts.length, 'malware'),
	];

	return {
		teamSlug: team.slug,
		subject: `Malware Digest for ${team.name}`,
		message,
		actions,
	};
}

export async function createAndSendMalwareDigests(
	config: Config,
	teams: Team[],
	repoOwners: view_repo_ownership[],
	malwareResults: EvaluationResult[],
) {
	if (malwareResults.length === 0) {
		return undefined;
	}
	const digests = teams
		.map((team) =>
			createMalwareDigest(
				team,
				repoOwners,
				malwareResults,
				config.cutOffInDays,
			),
		)
		.filter((d): d is VulnerabilityDigest => d !== undefined);

	console.log(`Sending malware digests`);
	digests.forEach((digest) => console.log(JSON.stringify(digest)));
	if (config.stage === 'PROD') {
		await sendVulnerabilityDigests(digests, config, 'malware');
	}
}
