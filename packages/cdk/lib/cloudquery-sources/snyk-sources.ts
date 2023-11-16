import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { Secret } from 'aws-cdk-lib/aws-ecs';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Secret as SecretsManager } from 'aws-cdk-lib/aws-secretsmanager';
import type { CloudquerySource } from '../ecs/cluster';
import { guardianSnykSourceConfig, snykSourceConfig } from '../ecs/config';

export class SnykSources {
	public readonly sources: CloudquerySource[];
	constructor(guStack: GuStack, app: string, nonProdSchedule?: Schedule) {
		const snykCredentials = new SecretsManager(guStack, 'snyk-credentials', {
			secretName: `/${guStack.stage}/${guStack.stack}/${app}/snyk-credentials`,
		});

		const snykSources: CloudquerySource[] = [
			{
				name: 'SnykAll',
				description: 'Collecting all Snyk data, except for projects',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '6' }),
				config: snykSourceConfig({
					tables: [
						'snyk_dependencies',
						'snyk_groups',
						'snyk_group_members',
						'snyk_integrations',
						'snyk_organizations',
						'snyk_organization_members',
						'snyk_reporting_issues',
						'snyk_reporting_latest_issues',
					],
					skipTables: ['snyk_organization_provisions'],
				}),
				secrets: {
					SNYK_API_KEY: Secret.fromSecretsManager(snykCredentials, 'api-key'),
				},
			},
			{
				name: 'GuardianCustomSnykProjects',
				description:
					'Collecting Snyk projects including grouped vulnerabilities and tags',
				schedule: nonProdSchedule ?? Schedule.cron({ minute: '0', hour: '5' }),
				config: guardianSnykSourceConfig({
					tables: ['snyk_projects'],
				}),
				secrets: {
					SNYK_API_KEY: Secret.fromSecretsManager(snykCredentials, 'api-key'),
				},
			},
		];
		this.sources = snykSources;
	}
}
