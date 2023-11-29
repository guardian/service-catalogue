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

export type AWSCloudformationTag = Record<string, string>;

export interface AWSCloudformationStack {
	stackName: string | null;
	tags: AWSCloudformationTag;
	creationTime: Date | null;
}

export interface GuRepoStack extends AWSCloudformationStack {
	guRepoName: string;
}
