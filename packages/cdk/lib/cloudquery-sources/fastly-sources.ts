import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { Secret } from 'aws-cdk-lib/aws-ecs';
import type { Schedule } from 'aws-cdk-lib/aws-events';
import { Secret as SecretsManager } from 'aws-cdk-lib/aws-secretsmanager';
import type { CloudquerySource } from '../ecs/cluster';
import { fastlySourceConfig } from '../ecs/config';

export class FastlySources {
	public readonly sources: CloudquerySource[];
	constructor(guStack: GuStack, schedule: Schedule) {
		const app = guStack.app ?? 'service-catalogue';
		const fastlyCredentials = new SecretsManager(
			guStack,
			'fastly-credentials',
			{
				secretName: `/${guStack.stage}/${guStack.stack}/${app}/fastly-credentials`,
			},
		);

		const fastlySources: CloudquerySource[] = [
			{
				name: 'FastlyServices',
				description: 'Fastly services data',
				schedule,
				config: fastlySourceConfig({
					tables: [
						'fastly_services',
						'fastly_service_versions',
						'fastly_service_backends',
						'fastly_service_domains',
						'fastly_service_health_checks',
					],
				}),
				secrets: {
					FASTLY_API_KEY: Secret.fromSecretsManager(
						fastlyCredentials,
						'api-key',
					),
				},
			},
		];
		this.sources = fastlySources;
	}
}
