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
			github_team_id: BigInt(1),
			github_team_name: 'Team One',
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
});
