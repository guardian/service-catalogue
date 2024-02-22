import { type StrategyOptions } from '@octokit/auth-app';

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
