import assert from 'assert';
import { describe, it } from 'node:test';
import type {
	repocop_github_repository_rules,
	view_repo_ownership,
} from '@prisma/client';
import type { RepocopVulnerability } from 'common/src/types.js';
import type { EvaluationResult, Team } from '../../types.js';
import { removeRepoOwner } from '../shared-utilities.js';
import {
	createDigestForSeverity,
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
		const unpatchableInSLA = {
			...highRecentVuln,
			is_patchable: false,
			within_sla: true,
			package: 'unpatchableInSLA',
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
				unpatchableInSLA,
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
		assert.ok(messagesAsArray[3]!.includes('unpatchableInSLA'));
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
