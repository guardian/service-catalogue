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
};