import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

/**
 * A secret to hold the CloudQuery API key.
 * @see https://docs.cloudquery.io/docs/managing-cloudquery/deployments/generate-api-key
 */
export function cloudqueryApiKeySecret(scope: GuStack) {
	const app = 'service-catalogue';
	const { stack, stage } = scope;

	return new Secret(scope, 'cloudquery-api-key', {
		secretName: `/${stage}/${stack}/${app}/cloudquery-api-key`,
	});
}
