import type { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuRepository } from '@guardian/cdk/lib/constructs/ecr';
import { ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { CloudQueryPluginVersions } from 'cloudquery-tables/versions';

export const Images = {
	devxLogs: ContainerImage.fromRegistry('ghcr.io/guardian/devx-logs:2.1.0'),
	// https://github.com/guardian/cq-source-ns1
	ns1Source: ContainerImage.fromRegistry(
		`ghcr.io/guardian/cq-source-ns1:${CloudQueryPluginVersions.CloudqueryNs1}`,
	),
	postgres: ContainerImage.fromRegistry(
		'public.ecr.aws/docker/library/postgres:18.3-alpine3.23@sha256:1b13c640ae11f2f165d1e89667e5862b0017baf4c80fec2fb7377d86319859ba',
	),
	otelCollector: ContainerImage.fromRegistry(
		'public.ecr.aws/aws-observability/aws-otel-collector:v0.35.0',
	),
};

type EcrApp = 'cloudquery' | 'singleton' | 'prisma-migrate';

/**
 * Images built in CI by the service-catalogue and published to ECR by
 * guardian/actions-ecr/push. Builds of `main` are tagged `branch-main`.
 * Other tags (e.g. `build-<number>`) can be found in the ECR console.
 */
export const getEcrImage = (
	scope: GuStack,
	app: EcrApp,
	tag = 'branch-main',
) => {
	const id = `${app}-repository`;
	const repository =
		(scope.node.tryFindChild(id) as GuRepository | undefined) ??
		new GuRepository(scope, id, {
			name: `guardian/service-catalogue/${app}`,
		});

	return repository.getImage(tag);
};
