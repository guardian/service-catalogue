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
};

void describe('createDigest', () => {
	void it('returns undefined when the total vuln count is zero', () => {
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

	void it('returns a correctly ordered list of vulns in the message', () => {
		const patchableInSLA = {
			...highRecentVuln,
			is_patchable: true,
			within_sla: true,
			package: 'patchableInSLA',
		};

		const today = new Date();

		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);

		const dayBeforeYesterday = new Date(today);
		dayBeforeYesterday.setDate(today.getDate() - 2);

		const unpatchableInSLAToday = {
			...highRecentVuln,
			is_patchable: false,
			within_sla: true,
			package: 'unpatchableInSLAToday',
			alert_issue_date: today,
		};
		const unpatchableInSLAYesterday = {
			...highRecentVuln,
			is_patchable: false,
			within_sla: true,
			package: 'unpatchableInSLAYesterday',
			alert_issue_date: yesterday,
		};
		const unpatchableInSLADayBeforeYesterday = {
			...highRecentVuln,
			is_patchable: false,
			within_sla: true,
			package: 'unpatchableInSLADayBeforeYesterday',
			alert_issue_date: dayBeforeYesterday,
		};
		const patchableOutsideSLA = {
			...highRecentVuln,
			is_patchable: true,
			within_sla: false,
			package: 'patchableOutsideSLA',
		};
		const unpatchableOutsideSLA = {
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
		const messages: string = createDigestForSeverity(
			team,
			'high',
			[ownershipRecord],
			[resultWithVuln],
			60,
		)!.message;
		const messagesAsArray = messages
			.split('\n')
			.filter((ss) => ss.includes('contains a high severity vulnerability'));
		assert.ok(messagesAsArray[0]!.includes('patchableOutsideSLA'));
		assert.ok(messagesAsArray[1]!.includes('patchableInSLA'));
		assert.ok(messagesAsArray[2]!.includes('unpatchableOutsideSLA'));
		assert.ok(
			messagesAsArray[3]!.includes('unpatchableInSLADayBeforeYesterday'),
		);
		assert.ok(messagesAsArray[4]!.includes('unpatchableInSLAYesterday'));
		assert.ok(messagesAsArray[5]!.includes('unpatchableInSLAToday'));
	});

	void it('returns a digest when a result contains a vulnerability', () => {
		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [highRecentVuln],
		};
		assert.ok(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[resultWithVuln],
				60,
			)?.message.includes('leftpad'),
		);
	});

	void it('recognises that a SBT dependency could come from Maven', () => {
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
		assert.ok(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[resultWithVuln],
				60,
			)?.message.includes('sbt or maven'),
		);
	});

	void it('returns the correct digest for the correct team', () => {
		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [highRecentVuln],
		};
		const anotherVuln: RepocopVulnerability = {
			source: 'Dependabot',
			full_name: fullName,
			open: true,
			severity: 'high',
			package: 'rightpad',
			urls: ['example.com'],
			ecosystem: 'pip',
			alert_issue_date: new Date(),
			is_patchable: true,
			cves: ['CVE-123'],
			within_sla: true,
			scope: 'runtime',
			alert_type: 'general',
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
		assert.strictEqual(digest?.teamSlug, team.slug);
		assert.ok(digest.message.includes('leftpad'));

		const anotherDigest = createDigestForSeverity(
			anotherTeam,
			'high',
			[ownershipRecord, anotherOwnershipRecord],
			[resultWithVuln, anotherResultWithVuln],
			60,
		);
		assert.strictEqual(anotherDigest?.teamSlug, anotherTeam.slug);
		assert.ok(anotherDigest.message.includes('rightpad'));
	});

	void it('only returns vulnerabilities created in  the last 60 days', () => {
		const fiftyNineDaysAgo = new Date();
		fiftyNineDaysAgo.setDate(fiftyNineDaysAgo.getDate() - 59);
		const sixtyOneDaysAgo = new Date();
		sixtyOneDaysAgo.setDate(sixtyOneDaysAgo.getDate() - 61);

		const excluded: RepocopVulnerability = {
			...highRecentVuln,
			alert_issue_date: sixtyOneDaysAgo,
		};

		const included = {
			...excluded,
			package: 'rightpad',
			alert_issue_date: fiftyNineDaysAgo,
		};

		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [excluded, included],
		};

		const msg = createDigestForSeverity(
			team,
			'high',
			[ownershipRecord],
			[resultWithVuln],
			60,
		)?.message;
		console.log(msg);

		assert.ok(msg?.includes(included.package));
		assert.ok(!msg?.includes(excluded.package));
	});
});

void describe('createDigestForSeverity', () => {
	void it('should take notice when there are no valid CVEs', () => {
		const noCveVuln: RepocopVulnerability = {
			...highRecentVuln,
			cves: [],
		};
		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [noCveVuln],
		};

		assert.ok(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[resultWithVuln],
				60,
			)?.message.includes('no CVE provided'),
		);
	});
});

void describe('createDigestForSeverity', () => {
	void it('should take notice when there are no valid URLs', () => {
		const noUrlVuln: RepocopVulnerability = {
			...highRecentVuln,
			urls: [],
		};
		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [noUrlVuln],
		};
		/**  node:test way of determining if the message doesn't include the noUrlVuln.package 
			 - equivalent of `not.toContain` in Jest  */
		assert.ok(
			!createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[resultWithVuln],
				60,
			)?.message.includes(`[${noUrlVuln.package}](`),
		);
	});
});

void describe('removeNonRuntimeVulns', () => {
	void it('should remove non-runtime vulnerabilities', () => {
		const runtimeAndDevVulns: RepocopVulnerability[] = [
			highRecentVuln,
			{ ...highRecentVuln, scope: 'development' },
		];
		const resultWithVulns: EvaluationResult = {
			...result,
			vulnerabilities: runtimeAndDevVulns,
		};

		const filtered = removeNonRuntimeVulns([resultWithVulns]);
		assert.strictEqual(filtered.length, 1);
		assert.strictEqual(filtered[0]!.vulnerabilities.length, 1);
		assert.strictEqual(filtered[0]!.vulnerabilities[0]!.scope, 'runtime');
	});
	void it('should remove results with no runtime vulnerabilities', () => {
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
});

const recentMalware: RepocopVulnerability = {
	...highRecentVuln,
	alert_type: 'malware',
	package: 'bad-package',
};

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

		assert.strictEqual(digest?.teamSlug, team.slug);
		assert.ok(digest.message.includes('bad-package'));
		assert.ok(digest.subject.includes(`Malware Digest for ${team.name}`));
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
		assert.strictEqual(digest?.teamSlug, team.slug);
		assert.ok(digest.message.includes('bad-package'));
		assert.ok(!digest.message.includes('totally-different-package'));

		const anotherDigest = createMalwareDigest(
			anotherTeam,
			[ownershipRecord, anotherOwnershipRecord],
			[resultWithMalware, anotherResultWithMalware],
			60,
		);
		assert.strictEqual(anotherDigest?.teamSlug, anotherTeam.slug);
		assert.ok(anotherDigest.message.includes('totally-different-package'));
		assert.ok(!anotherDigest.message.includes('bad-package'));
	});

	void it('only returns malware created in the last 60 days', () => {
		const fiftyNineDaysAgo = new Date();
		fiftyNineDaysAgo.setDate(fiftyNineDaysAgo.getDate() - 59);

		const sixtyOneDaysAgo = new Date();
		sixtyOneDaysAgo.setDate(sixtyOneDaysAgo.getDate() - 61);

		const excluded: RepocopVulnerability = {
			...recentMalware,
			package: 'old-malware',
			alert_issue_date: sixtyOneDaysAgo,
		};

		const included: RepocopVulnerability = {
			...recentMalware,
			package: 'recent-malware',
			alert_issue_date: fiftyNineDaysAgo,
		};

		const resultWithMalware: EvaluationResult = {
			...result,
			vulnerabilities: [excluded, included],
		};

		const digest = createMalwareDigest(
			team,
			[ownershipRecord],
			[resultWithMalware],
			60,
		);

		assert.ok(digest?.message.includes('recent-malware'));
		assert.ok(!digest?.message.includes('old-malware'));
	});

	void it('returns a correctly ordered list of malware in the message', () => {
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);

		const patchableOutsideSLA: RepocopVulnerability = {
			...recentMalware,
			package: 'patchableOutsideSLA',
			is_patchable: true,
			within_sla: false,
			alert_issue_date: today,
		};

		const patchableInSLA: RepocopVulnerability = {
			...recentMalware,
			package: 'patchableInSLA',
			is_patchable: true,
			within_sla: true,
			alert_issue_date: today,
		};

		const unpatchableOutsideSLA: RepocopVulnerability = {
			...recentMalware,
			package: 'unpatchableOutsideSLA',
			is_patchable: false,
			within_sla: false,
			alert_issue_date: today,
		};

		const unpatchableInSLAOlder: RepocopVulnerability = {
			...recentMalware,
			package: 'unpatchableInSLAOlder',
			is_patchable: false,
			within_sla: true,
			alert_issue_date: yesterday,
		};

		const resultWithMalware: EvaluationResult = {
			...result,
			vulnerabilities: [
				unpatchableInSLAOlder,
				unpatchableOutsideSLA,
				patchableInSLA,
				patchableOutsideSLA,
			],
		};

		const message = createMalwareDigest(
			team,
			[ownershipRecord],
			[resultWithMalware],
			60,
		)!.message;

		const lines = message
			.split('\n')
			.filter((line) => line.includes('contains malware from'));

		assert.ok(lines[0]!.includes('patchableOutsideSLA'));
		assert.ok(lines[1]!.includes('patchableInSLA'));
		assert.ok(lines[2]!.includes('unpatchableOutsideSLA'));
		assert.ok(lines[3]!.includes('unpatchableInSLAOlder'));
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

		assert.ok(
			createMalwareDigest(
				team,
				[ownershipRecord],
				[resultWithMalware],
				60,
			)?.message.includes('No CVE provided'),
		);
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

		assert.ok(
			!createMalwareDigest(
				team,
				[ownershipRecord],
				[resultWithMalware],
				60,
			)?.message.includes(`[${malwareWithoutUrl.package}](`),
		);
	});
});
