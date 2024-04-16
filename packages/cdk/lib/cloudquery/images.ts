import { ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { Versions } from './versions';

export const Images = {
	cloudquery: ContainerImage.fromRegistry(
		`ghcr.io/guardian/service-catalogue/cloudquery:sha-bacccb49c85d2b461bb5fad1be84c534e476a066`,
	),
	devxLogs: ContainerImage.fromRegistry('ghcr.io/guardian/devx-logs:2'),
	amazonLinux: ContainerImage.fromRegistry(
		'public.ecr.aws/amazonlinux/amazonlinux:latest',
	),
	// https://github.com/guardian/cq-source-ns1
	ns1Source: ContainerImage.fromRegistry(
		`ghcr.io/guardian/cq-source-ns1:${Versions.CloudqueryNs1}`,
	),
	postgres: ContainerImage.fromRegistry(
		'public.ecr.aws/docker/library/postgres:16-alpine',
	),
	/**
	 * This image is built in CI by the service-catalogue, and tagged with the
	 * SHA of the corresponding commit
	 *
	 * To use a new image, update the SHA here. The full set of possible tags
	 * can be found at
	 * 	https://github.com/guardian/service-catalogue/pkgs/container/service-catalogue%2Fprisma-migrate
	 */
	prismaMigrate: ContainerImage.fromRegistry(
		'ghcr.io/guardian/service-catalogue/prisma-migrate:sha-cdd0348904373d72dcbbdd3bc943e6b5dc232d3c',
	),
	otelCollector: ContainerImage.fromRegistry(
		'public.ecr.aws/aws-observability/aws-otel-collector:v0.35.0',
	),
};
