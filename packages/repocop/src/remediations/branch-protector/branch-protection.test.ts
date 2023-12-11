import type {
	repocop_github_repository_rules,
	view_repo_ownership,
} from '@prisma/client';
import type { Team } from '../../types';
import { createBranchProtectionEvents } from './branch-protection';

const nullOwner: view_repo_ownership = {
	full_name: '',
	github_team_id: BigInt(0),
	github_team_name: '',
	repo_name: '',
	role_name: '',
	archived: false,
	galaxies_team: null,
	team_contact_email: null,
};

const teamOne: Team = {
	name: 'Team One',
	id: BigInt(1),
	slug: 'team-one',
};

describe('Team slugs should be findable for every team associated with a repo', () => {
	test('A repository that is owned by a team should be included in the list of messages', () => {
		const repo = 'guardian/repo1';
		const evaluatedRepo: repocop_github_repository_rules = {
			full_name: repo,
			default_branch_name: true,
			branch_protection: false,
			team_based_access: true,
			admin_access: true,
			archiving: true,
			topics: true,
			contents: true,
			evaluated_on: new Date(),
		};

		const teamOneOwner: view_repo_ownership = {
			...nullOwner,
			full_name: repo,
			github_team_id: BigInt(1),
			github_team_name: 'Team One',
		};

		const actual = createBranchProtectionEvents(
			[evaluatedRepo],
			[teamOneOwner],
			[teamOne],
			5,
		);

		expect(actual).toEqual([{ fullName: repo, teamNameSlugs: ['team-one'] }]);
	});

	test('A repository that has no owner should not be in the list of messages', () => {
		const repo = 'guardian/repo1';
		const evaluatedRepo: repocop_github_repository_rules = {
			full_name: repo,
			default_branch_name: true,
			branch_protection: false,
			team_based_access: true,
			admin_access: true,
			archiving: true,
			topics: true,
			contents: true,
			evaluated_on: new Date(),
		};

		const actual = createBranchProtectionEvents(
			[evaluatedRepo],
			[],
			[teamOne],
			5,
		);

		expect(actual.length).toEqual(0);
	});
});
