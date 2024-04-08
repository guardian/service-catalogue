import type { Action } from '@guardian/anghammarad';
import { Anghammarad, RequestedChannel } from '@guardian/anghammarad';
import type { view_repo_ownership } from '@prisma/client';
import type { Config } from '../../config';
import type {
	EvaluationResult,
	RepocopVulnerability,
	Team,
	VulnerabilityDigest,
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

function createHumanReadableVulnMessage(vuln: RepocopVulnerability): string {
	const dateString = new Date(vuln.alert_issue_date).toDateString();
	const ecosystem =
		vuln.ecosystem === 'maven' ? 'sbt or maven' : vuln.ecosystem;

	return String.raw`[${vuln.full_name}](https://github.com/${vuln.full_name}) contains a [${vuln.severity.toUpperCase()} vulnerability](${vuln.urls[0]}).
Introduced via **${vuln.package}** on ${dateString}, from ${ecosystem}.
This vulnerability ${vuln.is_patchable ? 'is ' : 'may *not* be '}patchable.`;
}

export function createDigest(
	team: Team,
	repoOwners: view_repo_ownership[],
	results: EvaluationResult[],
): VulnerabilityDigest | undefined {
	const resultsForTeam = getOwningRepos(team, repoOwners, results);
	const vulns = resultsForTeam.flatMap((r) => r.vulnerabilities);

	const totalVulnsCount = vulns.length;

	if (totalVulnsCount === 0) {
		return undefined;
	}

	const topVulns = getTopVulns(vulns);
	const listedVulnsCount = topVulns.length;
	const preamble = String.raw`Found ${totalVulnsCount} vulnerabilities across ${resultsForTeam.length} repositories.
Displaying the top ${listedVulnsCount} most urgent.
Note: DevX only aggregates vulnerability information for repositories with a production topic.`;

	const digestString = topVulns
		.map((v) => createHumanReadableVulnMessage(v))
		.join('\n\n');

	const message = `${preamble}\n\n${digestString}`;

	return {
		teamSlug: team.slug,
		subject: `Vulnerability Digest for ${team.name}`,
		message,
	};
}

export function isFirstOrThirdTuesdayOfMonth(date: Date) {
	const isTuesday = date.getDay() === 2;
	const inFirstWeek = date.getDate() <= 7;
	const inThirdWeek = date.getDate() >= 15 && date.getDate() <= 21;
	return isTuesday && (inFirstWeek || inThirdWeek);
}

function createGrafanaAction(teamSlug: string): Action {
	const url =
		'https://metrics.gutools.co.uk/explore?schemaVersion=1&panes=%7B%22rwi%22:%7B%22datasource%22:%22RuTckSB4k%22,%22queries%22:%5B%7B%22refId%22:%22A%22,%22datasource%22:%7B%22type%22:%22grafana-postgresql-datasource%22,%22uid%22:%22RuTckSB4k%22%7D,%22format%22:%22table%22,%22rawSql%22:%22SELECT%20%2A%20FROM%20repocop_vulnerabilities%20where%20repo_owner%20%3D%20%27' +
		teamSlug +
		'%27%20order%20by%20is_patchable%20desc%22,%22editorMode%22:%22code%22,%22sql%22:%7B%22columns%22:%5B%7B%22type%22:%22function%22,%22parameters%22:%5B%7B%22type%22:%22functionParameter%22,%22name%22:%22%2A%22%7D%5D%7D%5D,%22groupBy%22:%5B%7B%22type%22:%22groupBy%22,%22property%22:%7B%22type%22:%22string%22%7D%7D%5D,%22limit%22:50%7D,%22table%22:%22repocop_vulnerabilities%22,%22rawQuery%22:true%7D%5D,%22range%22:%7B%22from%22:%22now-1h%22,%22to%22:%22now%22%7D%7D%7D&orgId=1';
	return {
		cta: "View your teams' vulnerabilities in Grafana",
		url,
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

	const action: Action = {
		cta: "See 'Prioritise the vulnerabilities' of these docs for vulnerability obligations",
		url: 'https://security-hq.gutools.co.uk/documentation/vulnerability-management',
	};
	return Promise.all(
		digests.map(
			async (digest) =>
				await anghammarad.notify({
					subject: digest.subject,
					message: digest.message,
					actions: [action, createGrafanaAction(digest.teamSlug)],
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
