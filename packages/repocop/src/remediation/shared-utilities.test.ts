import { describe, expect, it } from 'vitest';
import { findContactableOwners, removeRepoOwner } from './shared-utilities';

describe('removeRepoOwner', () => {
	it('should strip the owner from the full repo name', () => {
		const fullRepoName = 'guardian/repo-1';
		const result: string = removeRepoOwner(fullRepoName);
		expect(result).toEqual('repo-1');
	});
});

describe('findContactableOwners', () => {
	it('should not return anything if nothing is passed in', () => {
		const result = findContactableOwners('my-repo', []);
		expect(result).toEqual([]);
	});
	it('should not return anything if the repo is not found in the table', () => {
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
		expect(result).toEqual([]);
	});
	it('should return a team if the full repo name is correct', () => {
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
		expect(result).toEqual(['team-one']);
	});
});
