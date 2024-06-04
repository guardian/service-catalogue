import type {
	repocop_github_repository_rules,
	view_repo_ownership,
} from '@prisma/client';
import type { EvaluationResult, RepocopVulnerability, Team } from '../../types';
import { removeRepoOwner } from '../shared-utilities';
import {
	createDigestForSeverity,
	daysLeftToFix,
	getTopVulns,
} from './vuln-digest';

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

describe('createDigest', () => {
	it('returns undefined when the total vuln count is zero', () => {
		expect(
			createDigestForSeverity(
				team,
				'high',
				[ownershipRecord],
				[result, anotherResult],
			),
		).toBeUndefined();
	});

	it('returns a digest when a result contains a vulnerability', () => {
		const vuln: RepocopVulnerability = {
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
		};
		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [vuln],
		};
		expect(
			createDigestForSeverity(team, 'high', [ownershipRecord], [resultWithVuln])
				?.message,
		).toContain('leftpad');
	});

	it('recognises that a SBT dependency could come from Maven', () => {
		const vuln: RepocopVulnerability = {
			source: 'Dependabot',
			full_name: fullName,
			open: true,
			severity: 'high',
			package: 'jackson',
			urls: ['example.com'],
			ecosystem: 'maven',
			alert_issue_date: new Date(),
			is_patchable: true,
			cves: ['CVE-123'],
		};
		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [vuln],
		};
		expect(
			createDigestForSeverity(team, 'high', [ownershipRecord], [resultWithVuln])
				?.message,
		).toContain('sbt or maven');
	});

	it('returns the correct digest for the correct team', () => {
		const vuln: RepocopVulnerability = {
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
		};
		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [vuln],
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
		);
		expect(digest?.teamSlug).toBe(team.slug);
		expect(digest?.message).toContain('leftpad');

		const anotherDigest = createDigestForSeverity(
			anotherTeam,
			'high',
			[ownershipRecord, anotherOwnershipRecord],
			[resultWithVuln, anotherResultWithVuln],
		);
		expect(anotherDigest?.teamSlug).toBe(anotherTeam.slug);
		expect(anotherDigest?.message).toContain('rightpad');
	});

	it('only returns vulnerabilities created after 30th April 2024', () => {
		const vuln: RepocopVulnerability = {
			source: 'Dependabot',
			full_name: fullName,
			open: true,
			severity: 'high',
			package: 'leftpad',
			urls: ['example.com'],
			ecosystem: 'pip',
			alert_issue_date: new Date('2024-04-30'),
			is_patchable: true,
			cves: ['CVE-123'],
		};

		const todayVuln = {
			...vuln,
			package: 'rightpad',
			alert_issue_date: new Date('2024-05-01'),
		};

		const resultWithVuln: EvaluationResult = {
			...result,
			vulnerabilities: [vuln, todayVuln],
		};

		const msg = createDigestForSeverity(
			team,
			'high',
			[ownershipRecord],
			[resultWithVuln],
		)?.message;
		console.log(msg);
		expect(msg).toContain('rightpad');
		expect(msg).not.toContain('leftpad');
	});
});

describe('getTopVulns', () => {
	it('returns results are sorted by repo', () => {
		const vulns = [
			{ full_name: 'guardian/repo-a', severity: 'critical' },
			{ full_name: 'guardian/repo-b', severity: 'high' },
			{ full_name: 'guardian/repo-a', severity: 'high' },
			{ full_name: 'guardian/repo-c', severity: 'high' },
		] as RepocopVulnerability[];
		expect(getTopVulns(vulns)).toStrictEqual([
			{ full_name: 'guardian/repo-a', severity: 'critical' },
			{ full_name: 'guardian/repo-a', severity: 'high' },
			{ full_name: 'guardian/repo-b', severity: 'high' },
			{ full_name: 'guardian/repo-c', severity: 'high' },
		]);
	});

	const v = {
		full_name: 'guardian/repo-a',
		severity: 'critical',
	};

	const vHigh = {
		...v,
		severity: 'high',
	};

	it('returns 10 results', () => {
		const vulns = new Array(20).fill(v) as RepocopVulnerability[];
		expect(getTopVulns(vulns).length).toBe(10);
	});

	it('returns results sorted by severity', () => {
		const vulns = [
			...(new Array(8).fill(vHigh) as RepocopVulnerability[]),
			...(new Array(8).fill(v) as RepocopVulnerability[]),
		];

		const topVulns = getTopVulns(vulns);

		const criticalCount = topVulns.filter(
			(v) => v.severity === 'critical',
		).length;
		const highCount = topVulns.filter((v) => v.severity === 'high').length;

		expect(criticalCount).toBe(8);
		expect(highCount).toBe(2);
	});
});

describe('daysLeftToFix', () => {
	const veryOldVuln: RepocopVulnerability = {
		source: 'Dependabot',
		full_name: fullName,
		open: true,
		severity: 'high',
		package: 'leftpad',
		urls: ['example.com'],
		ecosystem: 'pip',
		alert_issue_date: new Date('2021-01-01'),
		is_patchable: true,
		cves: ['CVE-123'],
	};
	test('should return 0 if we exceed the SLA', () => {
		expect(daysLeftToFix(veryOldVuln)).toBe(0);
	});
	test('should return 30 if a high vuln was raised in the last 24 hours', () => {
		const newHighVuln: RepocopVulnerability = {
			...veryOldVuln,
			alert_issue_date: new Date(),
		};
		const twentyThreeHoursAgo = new Date();
		twentyThreeHoursAgo.setHours(twentyThreeHoursAgo.getHours() - 23);
		const twentyThreeHourVuln = {
			...newHighVuln,
			alert_issue_date: twentyThreeHoursAgo,
		};

		expect(daysLeftToFix(newHighVuln)).toBe(30);
		expect(daysLeftToFix(twentyThreeHourVuln)).toBe(30);
	});
	test('should return 2 if a critical vuln was raised today', () => {
		const newCriticalVuln: RepocopVulnerability = {
			...veryOldVuln,
			severity: 'critical',
			alert_issue_date: new Date(),
		};
		expect(daysLeftToFix(newCriticalVuln)).toBe(2);
	});
});
