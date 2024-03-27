import { ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { Versions } from './versions';

export const Images = {
	cloudquery: ContainerImage.fromRegistry(
		`ghcr.io/cloudquery/cloudquery:${Versions.CloudqueryCli}`,
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
		'ghcr.io/guardian/service-catalogue/prisma-migrate:sha-06b60dc3f47bfdfe8997d3d622e91f5508733ece',
	),
};
