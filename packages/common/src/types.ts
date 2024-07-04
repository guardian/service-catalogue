import { type StrategyOptions } from '@octokit/auth-app';
import type { repocop_vulnerabilities } from '@prisma/client';

export type GithubAppSecret = {
	appId: string;
	base64PrivateKey: string;
	clientId: string;
	clientSecret: string;
	installationId: string;
};
export interface UpdateMessageEvent {
	fullName: string; // in the format of owner/repo-name
	teamNameSlugs: string[];
}

export type GitHubAppConfig = {
	strategyOptions: StrategyOptions;
	installationId: string;
};

export interface DependencyGraphIntegratorEvent {
	name: string;
}

export interface SnykIntegratorEvent {
	name: string;
	languages: string[];
}

//GraphQL types for adding PRs to GitHub Projects
interface PullRequestIdAndAuthor {
	author: {
		login: string;
	};
	id: string;
}

export interface PullRequestDetails {
	organization: {
		repository: {
			pullRequests: {
				nodes: [PullRequestIdAndAuthor];
			};
		};
	};
}

export interface ProjectId {
	organization: {
		projectV2: {
			id: string;
		};
	};
}

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'unknown';

export type RepocopVulnerability = Omit<
	repocop_vulnerabilities,
	'id' | 'repo_owner' | 'severity'
> & {
	severity: Severity;
};

// The number of days teams have to fix vulnerabilities of a given severity
export const SLAs: Record<Severity, number | undefined> = {
	critical: 2,
	high: 30,
	medium: undefined,
	low: undefined,
	unknown: undefined,
};

export type NonEmptyArray<T> = [T, ...T[]];
