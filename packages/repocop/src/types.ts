import type { Endpoints } from '@octokit/types';
import type {
	aws_cloudformation_stacks,
	github_repositories,
	github_teams,
	repocop_github_repository_rules,
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

interface Coordinate {
	remedies: null | string[]; //unsure about this
	reachability?: string;
	is_upgradeable?: true;
	is_fixable_snyk?: true;
	is_patchable?: true;
	representations: [
		{
			dependency: {
				package_name: string;
				package_version: string;
			};
		},
	];
}

interface Attributes {
	key?: string;
	risk?: {
		score: {
			model: string;
			value: number;
			updated_at: string; //or Date?
		};
		factors: [];
	};
	type?: string;
	title?: string;
	status: string;
	classes?: [{ id: string; type: string; source: string }] | null;
	ignored: boolean;
	problems: [
		{
			id: string; //CVE
			url: string;
			type: string;
			source: string;
			updated_at: string; //or Date?
			disclosed_at: string; //or Date?
			discovered_at: string; //or Date?
		},
	];
	created_at: string; //or Date?
	updated_at: string; //or Date?
	coordinates: Coordinate[];
	effective_severity_level: string;
}

interface Relationships {
	scan_item: {
		data: { id: string; type: 'project' }; //i think type is only ever project?
	};
	organization: {
		data: { id: string; type: 'organization' }; //same for organization
	};
}

export interface CqSnykIssue {
	id: string;
	attributes: Attributes;
	relationships: Relationships;
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

export type DependabotVulnResponse =
	Endpoints['GET /repos/{owner}/{repo}/dependabot/alerts']['response'];

export type Alert = DependabotVulnResponse['data'][number];

export interface RepoAndAlerts {
	shortName: string;
	/*
	 ** alerts is undefined if we catch an error, typically because dependabot is not enabled
	 */
	alerts: Alert[] | undefined;
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

export interface Tag {
	key: string;
	value: string;
}

export interface CqSnykProject {
	id: string;
	attributes: {
		name: string;
		tags: Tag[];
		type: string; //package manager
		origin: string;
		status: string;
		created: string; //or Date?
		settings?: { recurring_tests: { frequency: string } };
		lifecycle?: unknown[];
		read_only?: boolean;
		environment?: unknown[];
		target_file?: string;
		target_reference?: string;
		business_criticality?: unknown[];
	};
}

//End of Snyk REST API response types

export interface GuardianSnykTags {
	repo: string | undefined;
	branch: string | undefined;
}

// export interface SnykIssue {
// 	id: string;
// 	url: string;
// 	type?: string;
// 	title?: string;
// 	version?: string;
// 	language?: string;
// 	severity: string;
// 	isPatched: boolean;
// 	isIgnored: boolean;
// 	isPinnable: boolean;
// 	isPatchable: boolean;
// 	isUpgradable: boolean;
// 	Identifiers: {
// 		CVE: string[] | null;
// 		CWE: string[] | null;
// 		OSVDB: string[] | null;
// 	};
// 	disclosureTime: string; //or Date?
// 	package: string;
// 	packageManager: string;
// 	publicationTime: string; //or Date?
// }

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'unknown';

export type RepocopVulnerability = {
	source: 'Dependabot' | 'Snyk';
	fullName: string;
	open: boolean;
	severity: Severity;
	package: string;
	urls: string[];
	ecosystem: string;
	alert_issue_date: string;
	isPatchable: boolean;
	CVEs: string[];
};

export interface EvaluationResult {
	fullName: string;
	repocopRules: repocop_github_repository_rules;
	vulnerabilities: RepocopVulnerability[];
}

export interface VulnerabilityDigest {
	teamSlug: string;
	subject: string;
	message: string;
}
