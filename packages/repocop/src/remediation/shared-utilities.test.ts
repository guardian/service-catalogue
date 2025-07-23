import  assert from 'assert';
import { describe, it } from 'node:test';
import { findContactableOwners, removeRepoOwner } from './shared-utilities.js';

void describe('removeRepoOwner', () => {
	void it('should strip the owner from the full repo name', () => {
		const fullRepoName = 'guardian/repo-1';
		const result: string = removeRepoOwner(fullRepoName);
		assert.strictEqual(result, 'repo-1');
	});
});

void describe('findContactableOwners', () => {
	void it('should not return anything if nothing is passed in', () => {
		const result = findContactableOwners('my-repo', []);
		assert.deepStrictEqual(result, []);
	});
	void it('should not return anything if the repo is not found in the table', () => {
		const result = findContactableOwners('my-repo', [
			{
				full_repo_name: 'not-my-repo',
				github_team_id: BigInt(1),
				github_team_name: 'Team One',
				github_team_slug: 'team-one',
				short_repo_name: 'not-my-repo',
				role_name: 'admin',
				archived: false,
				galaxies_team: 'Team One',
				team_contact_email: 'team-one@email.com',
			},
		]);
		assert.deepStrictEqual(result, []);
	});
	void it('should return a team if the full repo name is correct', () => {
		const result = findContactableOwners('my-repo', [
			{
				full_repo_name: 'my-repo',
				github_team_id: BigInt(1),
				github_team_name: 'Team One',
				github_team_slug: 'team-one',
				short_repo_name: '',
				role_name: 'admin',
				archived: false,
				galaxies_team: 'Team One',
				team_contact_email: 'team-one@email.com',
			},
		]);
		assert.deepStrictEqual(result, ['team-one']);
	});
});
