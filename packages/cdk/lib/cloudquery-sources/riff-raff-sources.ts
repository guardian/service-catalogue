import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuSecurityGroup } from '@guardian/cdk/lib/constructs/ec2';
import { Secret } from 'aws-cdk-lib/aws-ecs';
import type { Schedule } from 'aws-cdk-lib/aws-events';
import { Secret as SecretsManager } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import type { CloudquerySource } from '../ecs/cluster';
import { riffraffSourcesConfig } from '../ecs/config';

export class RiffRaffSources {
	public readonly sources: CloudquerySource;
	constructor(guStack: GuStack, schedule: Schedule, app: string) {
		const riffRaffDatabaseAccessSecurityGroupParam =
			StringParameter.valueForStringParameter(
				guStack,
				`/${guStack.stage}/deploy/riff-raff/external-database-access-security-group`,
			);

		// Provisioned by RiffRaff to specifically allow applications other than RiffRaff to access its DB
		// See https://github.com/guardian/deploy-tools-platform/pull/731
		const applicationToRiffRaffDatabaseSecurityGroup =
			GuSecurityGroup.fromSecurityGroupId(
				guStack,
				'RiffRaffDatabaseAccessSecurityGroup',
				riffRaffDatabaseAccessSecurityGroupParam,
			);

		const cloudqueryRiffRaffDatabaseCredentials = new SecretsManager(
			guStack,
			'RiffRaffDatabaseCredentials',
			{
				secretName: `/${guStack.stage}/${guStack.stack}/${app}/riffraff-database-credentials`,
			},
		);

		const riffRaffSources: CloudquerySource = {
			name: 'RiffRaffData',
			description: "Source deployment data directly from riff-raff's database",
			schedule,
			config: riffraffSourcesConfig(),
			extraSecurityGroups: [applicationToRiffRaffDatabaseSecurityGroup],
			secrets: {
				RIFFRAFF_DB_USERNAME: Secret.fromSecretsManager(
					cloudqueryRiffRaffDatabaseCredentials,
					'username',
				),
				RIFFRAFF_DB_PASSWORD: Secret.fromSecretsManager(
					cloudqueryRiffRaffDatabaseCredentials,
					'password',
				),

				RIFFRAFF_DB_HOST: Secret.fromSecretsManager(
					cloudqueryRiffRaffDatabaseCredentials,
					'host',
				),
			},
		};

		this.sources = riffRaffSources;
	}
}
