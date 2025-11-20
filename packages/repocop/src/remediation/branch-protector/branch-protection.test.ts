import assert from 'assert';
import { describe, test } from 'node:test';
import type { view_repo_ownership } from '@prisma/client';
import { createBranchProtectionEvents } from './branch-protection.js';

const nullOwner: view_repo_ownership = {
	full_repo_name: '',
	github_team_id: BigInt(0),
	github_team_name: '',
	github_team_slug: '',
	short_repo_name: '',
	role_name: '',
	archived: false,
	galaxies_team: null,
	team_contact_email: null,
};

void describe('Team slugs should be findable for every team associated with a repo', () => {
	void test('A repository that is owned by a team should be included in the list of messages', () => {
		const repo = 'guardian/repo1';

		const teamOneOwner: view_repo_ownership = {
			...nullOwner,
			full_repo_name: repo,
			github_team_slug: 'team-one',
		};

		const actual = createBranchProtectionEvents([repo], [teamOneOwner]);

		assert.deepStrictEqual(actual, [
			{ fullName: repo, teamNameSlugs: ['team-one'] },
		]);
	});

	void test('A repository that has no owner should not be in the list of messages', () => {
		const repo = 'guardian/repo1';
		const actual = createBranchProtectionEvents([repo], []);

		assert.strictEqual(actual.length, 0);
	});

	void test('Multiple repositories with different owners should each get their own event', () => {
		const repo1 = 'guardian/repo1';
		const repo2 = 'guardian/repo2';

		const teamOneOwner: view_repo_ownership = {
			...nullOwner,
			full_repo_name: repo1,
			github_team_slug: 'team-alpha',
		};

		const teamTwoOwner: view_repo_ownership = {
			...nullOwner,
			full_repo_name: repo2,
			github_team_slug: 'team-beta',
		};

		const actual = createBranchProtectionEvents(
			[repo1, repo2],
			[teamOneOwner, teamTwoOwner],
		);

		assert.strictEqual(actual.length, 2);
		assert.deepStrictEqual(actual[0], {
			fullName: repo1,
			teamNameSlugs: ['team-alpha'],
		});
		assert.deepStrictEqual(actual[1], {
			fullName: repo2,
			teamNameSlugs: ['team-beta'],
		});
	});

	void test('A repository with multiple team owners should have all team slugs in one event', () => {
		const repo = 'guardian/multi-owner-repo';

		const teamAlphaOwner: view_repo_ownership = {
			...nullOwner,
			full_repo_name: repo,
			github_team_slug: 'team-alpha',
		};

		const teamBetaOwner: view_repo_ownership = {
			...nullOwner,
			full_repo_name: repo,
			github_team_slug: 'team-beta',
		};

		const actual = createBranchProtectionEvents(
			[repo],
			[teamAlphaOwner, teamBetaOwner],
		);

		assert.strictEqual(actual.length, 1);
		assert.ok(actual[0]);
		assert.strictEqual(actual[0].fullName, repo);
		assert.strictEqual(actual[0].teamNameSlugs.length, 2);
		assert.ok(actual[0].teamNameSlugs.includes('team-alpha'));
		assert.ok(actual[0].teamNameSlugs.includes('team-beta'));
	});

	void test('Empty repository list should return empty events', () => {
		const teamOwner: view_repo_ownership = {
			...nullOwner,
			full_repo_name: 'guardian/some-repo',
			github_team_slug: 'team-one',
		};

		const actual = createBranchProtectionEvents([], [teamOwner]);
		assert.strictEqual(actual.length, 0);
	});
});
