import type {
	repocop_github_repository_rules,
	view_repo_ownership,
} from '@prisma/client';
import type { RepocopVulnerability } from 'common/src/types';
import { describe, expect, it } from 'vitest';
import type { EvaluationResult, Team } from '../../types';
import { removeRepoOwner } from '../shared-utilities';
import { createDigestForSeverity } from './vuln-digest';

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
};

describe('createDigest', () => {
	it('returns undefined when the total vuln count is zero', () => {
		expect(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[result, anotherResult],
				60,
			),
		).toBeUndefined();
	});

	it('returns a digest when a result contains a vulnerability', () => {
		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [highRecentVuln],
		};
		expect(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[resultWithVuln],
				60,
			)?.message,
		).toContain('leftpad');
	});

	it('recognises that a SBT dependency could come from Maven', () => {
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
		expect(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[resultWithVuln],
				60,
			)?.message,
		).toContain('sbt or maven');
	});

	it('returns the correct digest for the correct team', () => {
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
		expect(digest?.teamSlug).toBe(team.slug);
		expect(digest?.message).toContain('leftpad');

		const anotherDigest = createDigestForSeverity(
			anotherTeam,
			'high',
			[ownershipRecord, anotherOwnershipRecord],
			[resultWithVuln, anotherResultWithVuln],
			60,
		);
		expect(anotherDigest?.teamSlug).toBe(anotherTeam.slug);
		expect(anotherDigest?.message).toContain('rightpad');
	});

	it('only returns vulnerabilities created in  the last 60 days', () => {
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
		expect(msg).toContain(included.package);
		expect(msg).not.toContain(excluded.package);
	});
});

describe('createDigestForSeverity', () => {
	it('should take notice when there are no valid CVEs', () => {
		const noCveVuln: RepocopVulnerability = {
			...highRecentVuln,
			cves: [],
		};
		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [noCveVuln],
		};
		expect(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[resultWithVuln],
				60,
			)?.message,
		).toContain('no CVE provided');
	});
});

describe('createDigestForSeverity', () => {
	it('should take notice when there are no valid URLs', () => {
		const noUrlVuln: RepocopVulnerability = {
			...highRecentVuln,
			urls: [],
		};
		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [noUrlVuln],
		};
		expect(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[resultWithVuln],
				60,
			)?.message,
		).not.toContain(`[${noUrlVuln.package}](`);
	});
});
