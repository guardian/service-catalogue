import assert from 'assert';
import { describe, it } from 'node:test';
import type {
	repocop_github_repository_rules,
	view_repo_ownership,
} from 'common/prisma-client/client.js';
import type { RepocopVulnerability } from 'common/src/types.js';
import type { EvaluationResult, Team } from '../../types.js';
import { removeRepoOwner } from '../shared-utilities.js';
import {
	createDigestForSeverity,
	createMalwareDigest,
	removeNonRuntimeVulns,
} from './vuln-digest.js';

const fullName = 'guardian/repo';
const anotherFullName = 'guardian/another-repo';
const teamSlug = 'team';
const teamId = BigInt(1);
const teamName = 'Team Name';

const team: Team = { id: teamId, name: teamName, slug: teamSlug };
const anotherTeam: Team = {
	id: BigInt(2),
	name: 'Another Team Name',
	slug: 'another-team',
};
const date = new Date('2021-01-01');

const ownershipRecord: view_repo_ownership = {
	github_team_name: teamName,
	github_team_id: teamId,
	github_team_slug: teamSlug,
	short_repo_name: removeRepoOwner(fullName),
	full_repo_name: fullName,
	role_name: '',
	archived: false,
	galaxies_team: null,
	team_contact_email: null,
};

const repocopRuleEvaluation: repocop_github_repository_rules = {
	default_branch_name: true,
	branch_protection: true,
	team_based_access: true,
	admin_access: true,
	archiving: true,
	topics: true,
	contents: true,
	evaluated_on: date,
	vulnerability_tracking: true,
	full_name: fullName,
};

const anotherOwnershipRecord: view_repo_ownership = {
	...ownershipRecord,
	github_team_name: anotherTeam.name,
	github_team_id: anotherTeam.id,
	full_repo_name: anotherFullName,
	github_team_slug: anotherTeam.slug,
	short_repo_name: removeRepoOwner(anotherFullName),
};

const anotherRepocopRuleEvaluation: repocop_github_repository_rules = {
	...repocopRuleEvaluation,
	full_name: anotherFullName,
};

const result: EvaluationResult = {
	fullName,
	repocopRules: repocopRuleEvaluation,
	vulnerabilities: [],
};

const anotherResult: EvaluationResult = {
	fullName: anotherFullName,
	repocopRules: anotherRepocopRuleEvaluation,
	vulnerabilities: [],
};

const highRecentVuln: RepocopVulnerability = {
	source: 'Dependabot',
	full_name: fullName,
	open: true,
	severity: 'high',
	package: 'leftpad',
	urls: ['example.com'],
	ecosystem: 'pip',
	alert_issue_date: new Date(),
	is_patchable: true,
	cves: ['CVE-123'],
	within_sla: true,
	scope: 'runtime',
	alert_type: 'general',
	advisory_published_at: new Date('2026-06-18T00:00:00.000Z'),
	advisory_updated_at: new Date('2026-06-18T00:00:00.000Z'),
	advisory_withdrawn_at: null,
	alert_updated_at: new Date('2026-06-18T00:00:00.000Z'),
	html_url: 'https://github.com/guardian/some-repo/security/dependabot/1',
};

const recentMalware: RepocopVulnerability = {
	...highRecentVuln,
	alert_type: 'malware',
	package: 'bad-package',
};

function getMessage(value: { message: string } | undefined): string {
	assert.ok(value, 'Expected a digest to be returned');
	return value.message;
}

function assertSubstringsInOrder(message: string, substrings: string[]): void {
	let lastIndex = -1;
	let previousSubstring: string | undefined;

	for (const substring of substrings) {
		const index = message.indexOf(substring, lastIndex + 1);
		assert.notStrictEqual(
			index,
			-1,
			`Expected message to include "${substring}" after "${previousSubstring ?? 'start of message'}"`,
		);
		assert.ok(
			index > lastIndex,
			previousSubstring
				? `Expected "${substring}" to appear after "${previousSubstring}"`
				: `Expected "${substring}" to appear after the previous item`,
		);
		lastIndex = index;
		previousSubstring = substring;
	}
}

function daysAgo(days: number): Date {
	const value = new Date();
	value.setDate(value.getDate() - days);
	return value;
}

void describe('createDigestForSeverity', () => {
	void it('returns undefined when the total vulnerability count is zero', () => {
		assert.strictEqual(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[result, anotherResult],
				60,
			),
			undefined,
		);
	});

	void it('returns vulnerabilities in priority order', () => {
		const patchableInSLA: RepocopVulnerability = {
			...highRecentVuln,
			is_patchable: true,
			within_sla: true,
			package: 'patchableInSLA',
		};

		const unpatchableInSLAToday: RepocopVulnerability = {
			...highRecentVuln,
			is_patchable: false,
			within_sla: true,
			package: 'unpatchableInSLAToday',
			alert_issue_date: daysAgo(0),
		};

		const unpatchableInSLAYesterday: RepocopVulnerability = {
			...highRecentVuln,
			is_patchable: false,
			within_sla: true,
			package: 'unpatchableInSLAYesterday',
			alert_issue_date: daysAgo(1),
		};

		const unpatchableInSLADayBeforeYesterday: RepocopVulnerability = {
			...highRecentVuln,
			is_patchable: false,
			within_sla: true,
			package: 'unpatchableInSLADayBeforeYesterday',
			alert_issue_date: daysAgo(2),
		};

		const patchableOutsideSLA: RepocopVulnerability = {
			...highRecentVuln,
			is_patchable: true,
			within_sla: false,
			package: 'patchableOutsideSLA',
		};

		const unpatchableOutsideSLA: RepocopVulnerability = {
			...highRecentVuln,
			is_patchable: false,
			within_sla: false,
			package: 'unpatchableOutsideSLA',
		};

		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [
				unpatchableInSLAToday,
				unpatchableInSLAYesterday,
				unpatchableInSLADayBeforeYesterday,
				unpatchableOutsideSLA,
				patchableInSLA,
				patchableOutsideSLA,
			],
		};

		const message = getMessage(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[resultWithVuln],
				60,
			),
		);

		assertSubstringsInOrder(message, [
			'patchableOutsideSLA',
			'patchableInSLA',
			'unpatchableOutsideSLA',
			'unpatchableInSLADayBeforeYesterday',
			'unpatchableInSLAYesterday',
			'unpatchableInSLAToday',
		]);
	});

	void it('returns a digest when a result contains a vulnerability', () => {
		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [highRecentVuln],
		};

		const digest = createDigestForSeverity(
			team,
			'high',
			[ownershipRecord],
			[resultWithVuln],
			60,
		);

		assert.ok(digest);
		assert.match(digest.message, /leftpad/);
	});

	void it('recognises that an SBT dependency could come from Maven', () => {
		const vuln: RepocopVulnerability = {
			...highRecentVuln,
			package: 'jackson',
			urls: ['example.com'],
			ecosystem: 'maven',
		};

		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [vuln],
		};

		const message = getMessage(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[resultWithVuln],
				60,
			),
		);

		assert.match(message, /sbt or maven/);
	});

	void it('returns the correct digest for the correct team', () => {
		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [highRecentVuln],
		};

		const anotherVuln: RepocopVulnerability = {
			...highRecentVuln,
			full_name: anotherFullName,
			package: 'rightpad',
		};

		const anotherResultWithVuln: EvaluationResult = {
			...anotherResult,
			vulnerabilities: [anotherVuln],
		};

		const digest = createDigestForSeverity(
			team,
			'high',
			[ownershipRecord, anotherOwnershipRecord],
			[resultWithVuln, anotherResultWithVuln],
			60,
		);

		assert.ok(digest);
		assert.strictEqual(digest.teamSlug, team.slug);
		assert.match(digest.message, /leftpad/);
		assert.doesNotMatch(digest.message, /rightpad/);

		const anotherDigest = createDigestForSeverity(
			anotherTeam,
			'high',
			[ownershipRecord, anotherOwnershipRecord],
			[resultWithVuln, anotherResultWithVuln],
			60,
		);

		assert.ok(anotherDigest);
		assert.strictEqual(anotherDigest.teamSlug, anotherTeam.slug);
		assert.match(anotherDigest.message, /rightpad/);
		assert.doesNotMatch(anotherDigest.message, /leftpad/);
	});

	void it('only returns vulnerabilities created in the last 60 days', () => {
		const included: RepocopVulnerability = {
			...highRecentVuln,
			package: 'rightpad',
			alert_issue_date: daysAgo(59),
		};

		const excluded: RepocopVulnerability = {
			...highRecentVuln,
			package: 'oldpad',
			alert_issue_date: daysAgo(61),
		};

		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [excluded, included],
		};

		const message = getMessage(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[resultWithVuln],
				60,
			),
		);

		assert.match(message, /rightpad/);
		assert.doesNotMatch(message, /oldpad/);
	});

	void it('uses a fallback when there is no CVE', () => {
		const noCveVuln: RepocopVulnerability = {
			...highRecentVuln,
			cves: [],
		};

		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [noCveVuln],
		};

		const message = getMessage(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[resultWithVuln],
				60,
			),
		);

		assert.match(message, /no cve provided/i);
	});

	void it('uses plain package text when there are no valid URLs', () => {
		const noUrlVuln: RepocopVulnerability = {
			...highRecentVuln,
			urls: [],
		};

		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [noUrlVuln],
		};

		const message = getMessage(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[resultWithVuln],
				60,
			),
		);

		assert.doesNotMatch(message, new RegExp(`\\[${noUrlVuln.package}\\]\\(`));
		assert.match(message, new RegExp(noUrlVuln.package));
	});

	void it('ignores vulnerabilities with a different severity', () => {
		const mediumVuln: RepocopVulnerability = {
			...highRecentVuln,
			severity: 'medium',
			package: 'medium-package',
		};

		const resultWithMixedVulns: EvaluationResult = {
			...result,
			vulnerabilities: [highRecentVuln, mediumVuln],
		};

		const message = getMessage(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[resultWithMixedVulns],
				60,
			),
		);

		assert.match(message, /leftpad/);
		assert.doesNotMatch(message, /medium-package/);
	});
	void it('ignores malware vulnerabilities when passed mixed results', () => {
		const malwareVuln: RepocopVulnerability = {
			...highRecentVuln,
			package: 'bad-package',
			alert_type: 'malware',
		};

		const resultWithMixedAlerts: EvaluationResult = {
			...result,
			vulnerabilities: [highRecentVuln, malwareVuln],
		};

		const message = getMessage(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[resultWithMixedAlerts],
				60,
			),
		);

		assert.match(message, /leftpad/);
		assert.doesNotMatch(message, /bad-package/);
	});
});

void describe('removeNonRuntimeVulns', () => {
	void it('removes non-runtime vulnerabilities', () => {
		const runtimeAndDevVulns: RepocopVulnerability[] = [
			highRecentVuln,
			{ ...highRecentVuln, scope: 'development', package: 'dev-only' },
		];

		const resultWithVulns: EvaluationResult = {
			...result,
			vulnerabilities: runtimeAndDevVulns,
		};

		const filtered = removeNonRuntimeVulns([resultWithVulns]);

		assert.strictEqual(filtered.length, 1);
		assert.strictEqual(filtered[0]!.vulnerabilities.length, 1);
		assert.strictEqual(filtered[0]!.vulnerabilities[0]!.scope, 'runtime');
		assert.strictEqual(filtered[0]!.vulnerabilities[0]!.package, 'leftpad');
	});

	void it('removes results with no runtime vulnerabilities', () => {
		const devVuln: RepocopVulnerability = {
			...highRecentVuln,
			scope: 'development',
		};

		const resultWithDevVuln: EvaluationResult = {
			...result,
			vulnerabilities: [devVuln],
		};

		const filtered = removeNonRuntimeVulns([resultWithDevVuln]);

		assert.strictEqual(filtered.length, 0);
	});

	void it('does not mutate the original results', () => {
		const runtimeAndDevVulns: RepocopVulnerability[] = [
			highRecentVuln,
			{ ...highRecentVuln, scope: 'development', package: 'dev-only' },
		];

		const resultWithVulns: EvaluationResult = {
			...result,
			vulnerabilities: runtimeAndDevVulns,
		};

		const originalLength = resultWithVulns.vulnerabilities.length;

		void removeNonRuntimeVulns([resultWithVulns]);

		assert.strictEqual(resultWithVulns.vulnerabilities.length, originalLength);
		assert.strictEqual(resultWithVulns.vulnerabilities[1]!.package, 'dev-only');
		assert.strictEqual(
			resultWithVulns.vulnerabilities[1]!.scope,
			'development',
		);
	});
});

void describe('createMalwareDigest', () => {
	void it('returns undefined when the total malware count is zero', () => {
		assert.strictEqual(
			createMalwareDigest(team, [ownershipRecord], [result, anotherResult], 60),
			undefined,
		);
	});

	void it('returns a digest when a result contains malware', () => {
		const resultWithMalware: EvaluationResult = {
			...result,
			vulnerabilities: [recentMalware],
		};

		const digest = createMalwareDigest(
			team,
			[ownershipRecord],
			[resultWithMalware],
			60,
		);

		assert.ok(digest);
		assert.strictEqual(digest.teamSlug, team.slug);
		assert.match(digest.message, /bad-package/);
		assert.match(digest.subject, new RegExp(`Malware Digest for ${team.name}`));
	});

	void it('returns the correct malware digest for the correct team', () => {
		const resultWithMalware: EvaluationResult = {
			...result,
			vulnerabilities: [recentMalware],
		};

		const anotherMalware: RepocopVulnerability = {
			...recentMalware,
			full_name: anotherFullName,
			package: 'totally-different-package',
		};

		const anotherResultWithMalware: EvaluationResult = {
			...anotherResult,
			vulnerabilities: [anotherMalware],
		};

		const digest = createMalwareDigest(
			team,
			[ownershipRecord, anotherOwnershipRecord],
			[resultWithMalware, anotherResultWithMalware],
			60,
		);

		assert.ok(digest);
		assert.strictEqual(digest.teamSlug, team.slug);
		assert.match(digest.message, /bad-package/);
		assert.doesNotMatch(digest.message, /totally-different-package/);

		const anotherDigest = createMalwareDigest(
			anotherTeam,
			[ownershipRecord, anotherOwnershipRecord],
			[resultWithMalware, anotherResultWithMalware],
			60,
		);

		assert.ok(anotherDigest);
		assert.strictEqual(anotherDigest.teamSlug, anotherTeam.slug);
		assert.match(anotherDigest.message, /totally-different-package/);
		assert.doesNotMatch(anotherDigest.message, /bad-package/);
	});

	void it('only returns malware created in the last 60 days', () => {
		const excluded: RepocopVulnerability = {
			...recentMalware,
			package: 'old-malware',
			alert_issue_date: daysAgo(61),
		};

		const included: RepocopVulnerability = {
			...recentMalware,
			package: 'recent-malware',
			alert_issue_date: daysAgo(59),
		};

		const resultWithMalware: EvaluationResult = {
			...result,
			vulnerabilities: [excluded, included],
		};

		const message = getMessage(
			createMalwareDigest(team, [ownershipRecord], [resultWithMalware], 60),
		);

		assert.match(message, /recent-malware/);
		assert.doesNotMatch(message, /old-malware/);
	});

	void it('uses a fallback when there is no CVE', () => {
		const malwareWithoutCve: RepocopVulnerability = {
			...recentMalware,
			cves: [],
		};

		const resultWithMalware: EvaluationResult = {
			...result,
			vulnerabilities: [malwareWithoutCve],
		};

		const message = getMessage(
			createMalwareDigest(team, [ownershipRecord], [resultWithMalware], 60),
		);

		assert.match(message, /no cve provided/i);
	});

	void it('uses plain package text when there is no URL', () => {
		const malwareWithoutUrl: RepocopVulnerability = {
			...recentMalware,
			urls: [],
		};

		const resultWithMalware: EvaluationResult = {
			...result,
			vulnerabilities: [malwareWithoutUrl],
		};

		const message = getMessage(
			createMalwareDigest(team, [ownershipRecord], [resultWithMalware], 60),
		);

		assert.doesNotMatch(
			message,
			new RegExp(`\\[${malwareWithoutUrl.package}\\]\\(`),
		);
		assert.match(message, new RegExp(malwareWithoutUrl.package));
	});

	void it('ignores non-malware vulnerabilities', () => {
		const nonMalwareVuln: RepocopVulnerability = {
			...highRecentVuln,
			package: 'not-malware',
			alert_type: 'general',
		};

		const resultWithMixedAlerts: EvaluationResult = {
			...result,
			vulnerabilities: [recentMalware, nonMalwareVuln],
		};

		const message = getMessage(
			createMalwareDigest(team, [ownershipRecord], [resultWithMixedAlerts], 60),
		);

		assert.match(message, /bad-package/);
		assert.doesNotMatch(message, /not-malware/);
	});
});
