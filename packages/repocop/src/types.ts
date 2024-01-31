import type { Endpoints } from '@octokit/types';
import type {
	aws_cloudformation_stacks,
	github_repositories,
	github_team_repositories,
	github_teams,
} from '@prisma/client';

export type NonEmptyArray<T> = [T, ...T[]];

export interface RepoAndStack {
	fullName: string;
	stacks: string[];
}

type TeamFields = Pick<github_teams, 'slug' | 'id' | 'name'>;

export interface Team extends TeamFields {
	slug: NonNullable<TeamFields['slug']>;
	id: NonNullable<TeamFields['id']>;
	name: NonNullable<TeamFields['name']>;
}

type RepositoryFields = Pick<
	github_repositories,
	| 'archived'
	| 'name'
	| 'full_name'
	| 'topics'
	| 'updated_at'
	| 'pushed_at'
	| 'created_at'
	| 'id'
	| 'default_branch'
>;

export interface Repository extends RepositoryFields {
	archived: NonNullable<RepositoryFields['archived']>;
	name: NonNullable<RepositoryFields['name']>;
	full_name: NonNullable<RepositoryFields['full_name']>;
	id: NonNullable<RepositoryFields['id']>;
}

type StackFields = Pick<
	aws_cloudformation_stacks,
	'stack_name' | 'tags' | 'creation_time'
>;

type AWSCloudformationTag = Record<string, string>;

export interface AwsCloudFormationStack extends StackFields {
	stack_name: NonNullable<StackFields['stack_name']>;
	tags: AWSCloudformationTag;
	creation_time: NonNullable<StackFields['creation_time']>;
}

type TeamRepositoryFields = Pick<
	github_team_repositories,
	'id' | 'team_id' | 'role_name'
>;

export interface TeamRepository extends TeamRepositoryFields {
	id: NonNullable<TeamRepositoryFields['id']>; //repository id
	team_id: NonNullable<TeamRepositoryFields['team_id']>;
	role_name: NonNullable<TeamRepositoryFields['role_name']>;
}

export type DependabotVulnResponse =
	Endpoints['GET /repos/{owner}/{repo}/dependabot/alerts']['response'];

export type Alert = DependabotVulnResponse['data'][number];

export type PartialAlert = Pick<
	Alert,
	'state' | 'dependency' | 'security_vulnerability' | 'created_at'
>;

export interface RepoAndAlerts {
	shortName: string;
	/*
	 ** alerts is undefined if we catch an error, typically because dependabot is not enabled
	 */
	alerts: PartialAlert[] | undefined;
}

// Snyk REST API response types
interface SnykOrg {
	id: string;
	name: string;
	slug: string;
}
export interface SnykOrgResponse {
	orgs: SnykOrg[];
}

export interface ProjectTag {
	key: string;
	value: string;
}

export interface SnykProject {
	id: string;
	attributes: {
		name: string;
		origin: string;
		status: string;
		tags: ProjectTag[];
	};
}

interface Next {
	next: string;
}

export interface SnykProjectsResponse {
	data: SnykProject[];
	links: Next | undefined;
}

//End of Snyk REST API response types

export interface GuardianSnykTags {
	repo: string | undefined;
	branch: string | undefined;
}

export interface SnykIssue {
	id: string;
	type?: string;
	title?: string;
	version?: string;
	language?: string;
	severity: string;
	isPatched: boolean;
	isPinnable: false;
	isPatchable: boolean;
	isUpgradable: boolean;
	disclosureTime: string; //or Date?
	packageManager?: string;
	publicationTime: string; //or Date?
}
