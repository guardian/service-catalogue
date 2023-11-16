import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { Secret } from 'aws-cdk-lib/aws-ecs';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Secret as SecretsManager } from 'aws-cdk-lib/aws-secretsmanager';
import type { CloudquerySource } from '../ecs/cluster';
import { githubSourceConfig } from '../ecs/config';

export class GithubSources {
	public readonly sources: CloudquerySource[];
	constructor(
		guStack: GuStack,
		app: string,
		nonProdSchedule: Schedule | undefined,
	) {
		const cloudqueryGithubCredentials = new SecretsManager(
			guStack,
			'github-credentials',
			{
				secretName: `/${guStack.stage}/${guStack.stack}/${app}/github-credentials`,
			},
		);

		const githubSecrets: Record<string, Secret> = {
			GITHUB_PRIVATE_KEY: Secret.fromSecretsManager(
				cloudqueryGithubCredentials,
				'private-key',
			),
			GITHUB_APP_ID: Secret.fromSecretsManager(
				cloudqueryGithubCredentials,
				'app-id',
			),
			GITHUB_INSTALLATION_ID: Secret.fromSecretsManager(
				cloudqueryGithubCredentials,
				'installation-id',
			),
		};

		const additionalGithubCommands = [
			'echo $GITHUB_PRIVATE_KEY | base64 -d > /github-private-key',
			'echo $GITHUB_APP_ID > /github-app-id',
			'echo $GITHUB_INSTALLATION_ID > /github-installation-id',
		];

		const githubSources: CloudquerySource[] = [
			{
				name: 'GitHubRepositories',
				description:
					'Collect GitHub repository data. Uses include RepoCop, which flags repositories that do not meet certain obligations.',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '0' }),
				config: githubSourceConfig({
					tables: [
						'github_repositories',
						'github_repository_branches',
						'github_workflows',
					],

					// We're not (yet) interested in the following tables, so do not collect them to reduce API quota usage.
					// See https://www.cloudquery.io/docs/advanced-topics/performance-tuning#improve-performance-by-skipping-relations
					skipTables: [
						'github_releases',
						'github_release_assets',
						'github_repository_dependabot_alerts',
						'github_repository_dependabot_secrets',
					],
				}),
				secrets: githubSecrets,
				additionalCommands: additionalGithubCommands,
			},
			{
				name: 'GitHubTeams',
				description:
					'Collect GitHub team data. Uses include identifying which repositories a team owns.',
				schedule:
					nonProdSchedule ??
					Schedule.cron({ weekDay: '1', hour: '10', minute: '0' }),
				config: githubSourceConfig({
					tables: [
						'github_organizations',
						'github_organization_members',
						'github_teams',
						'github_team_members',
						'github_team_repositories',
					],
					skipTables: [
						/*
						These tables are children of github_organizations.
						ServiceCatalogue collects child tables automatically.
						We don't use them as they take a long time to collect, so skip them.
						See https://www.cloudquery.io/docs/advanced-topics/performance-tuning#improve-performance-by-skipping-relations
						 */
						'github_organization_dependabot_alerts',
						'github_organization_dependabot_secrets',
					],
				}),
				secrets: githubSecrets,
				additionalCommands: additionalGithubCommands,
			},
			{
				name: 'GitHubIssues',
				description: 'Collect GitHub issue data (PRs and Issues)',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '2' }),
				config: githubSourceConfig({
					tables: ['github_issues'],
				}),
				secrets: githubSecrets,
				additionalCommands: additionalGithubCommands,
			},
		];
		this.sources = githubSources;
	}
}
