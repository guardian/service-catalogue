import type { Action } from '@guardian/anghammarad';
import type { Endpoints } from '@octokit/types';
import type {
	aws_cloudformation_stacks,
	github_teams,
	repocop_github_repository_rules,
} from '@prisma/client';
import type { AwsTags, RepocopVulnerability } from 'common/src/types';

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

export interface Dependency {
	dependency: {
		package_name: string;
		package_version: string;
	};
}

type StackFields = Pick<
	aws_cloudformation_stacks,
	'stack_name' | 'tags' | 'creation_time'
>;

export interface AwsCloudFormationStack extends StackFields {
	stack_name: NonNullable<StackFields['stack_name']>;
	tags: AwsTags;
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
export interface EvaluationResult {
	fullName: string;
	repocopRules: repocop_github_repository_rules;
	vulnerabilities: RepocopVulnerability[];
}

export interface VulnerabilityDigest {
	teamSlug: string;
	subject: string;
	message: string;
	actions: Action[];
}
