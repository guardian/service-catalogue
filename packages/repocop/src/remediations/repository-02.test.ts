import type { github_teams, view_repo_ownership } from '@prisma/client';
import { findContactableOwners } from './repository-02';

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

const nullTeam: github_teams = {
	cq_sync_time: null,
	cq_source_name: null,
	cq_id: '',
	cq_parent_id: null,
	org: '',
	id: BigInt(0),
	node_id: null,
	name: null,
	description: null,
	url: null,
	slug: null,
	permission: null,
	permissions: null,
	privacy: null,
	members_count: null,
	repos_count: null,
	organization: null,
	html_url: null,
	members_url: null,
	repositories_url: null,
	parent: null,
	ldap_dn: null,
};

describe('Team slugs should be findable for every team associated with a repo', () => {
	test('branch is not main', () => {
		const repo = 'guardian/repo1';
		const owner1: view_repo_ownership = {
			...nullOwner,
			full_name: repo,
			github_team_id: BigInt(1),
			github_team_name: 'Team One',
		};
		const owner2: view_repo_ownership = {
			...nullOwner,
			full_name: repo,
			github_team_id: BigInt(2),
			github_team_name: 'Team Two',
		};
		const owner3: view_repo_ownership = {
			...nullOwner,
			full_name: 'guardian/repo3',
			github_team_id: BigInt(3),
			github_team_name: 'Team Three',
		};

		const team1 = {
			...nullTeam,
			id: BigInt(1),
			slug: 'team-one',
		};
		const team2 = {
			...nullTeam,
			id: BigInt(2),
			slug: 'team-two',
		};
		const team3 = {
			...nullTeam,
			id: BigInt(3),
			slug: 'team-three',
		};

		const teams: github_teams[] = [team1, team2, team3];

		const owners: view_repo_ownership[] = [owner1, owner2, owner3];

		const actual = findContactableOwners(repo, owners, teams);

		expect(actual).toEqual([team1.slug, team2.slug]);
	});
});
