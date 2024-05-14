import 'source-map-support/register';
import { RiffRaffYamlFile } from '@guardian/cdk/lib/riff-raff-yaml-file';
import { App, Duration } from 'aws-cdk-lib';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { ServiceCatalogue } from '../lib/service-catalogue';

const app = new App();

const stack = 'deploy';
const region = 'eu-west-1';

new ServiceCatalogue(app, 'ServiceCatalogue-PROD', {
	stack,
	stage: 'PROD',
	env: { region },
	multiAz: true,
	cloudFormationStackName: 'deploy-PROD-service-catalogue',
});

new ServiceCatalogue(app, 'ServiceCatalogue-CODE', {
	stack,
	stage: 'CODE',
	env: { region },
	schedule: Schedule.rate(Duration.days(30)),
	rdsDeletionProtection: false,
	cloudFormationStackName: 'deploy-CODE-service-catalogue',
});

// Add an additional S3 deployment type and synth riff-raff.yaml

const riffRaff = new RiffRaffYamlFile(app);

const deployments = riffRaff.riffRaffYaml.deployments;

deployments.set('service-catalogue-prisma-migrations', {
	type: 'aws-s3',
	contentDirectory: 'prisma',
	app: 'prisma-migrate-task',
	parameters: {
		cacheControl: 'no-store',
		publicReadAcl: false,
	},
	regions: new Set([region]),
	stacks: new Set([stack]),

	/*
	The prisma-migrate ECS task is:
			- Updated via a CloudFormation deployment
			- Triggered by a file landing in S3

	This deployment uploads the file to S3,
	and only runs once the CloudFormation deployment succeeds.

	This ensures the correct versions are used.
	*/
	dependencies: ['cfn-eu-west-1-deploy-service-catalogue'],
});

deployments.set('theguardian-servicecatalogue-app', {
	type: 'aws-s3',
	contentDirectory: 'theguardian-servicecatalogue-app',
	app: 'theguardian-servicecatalogue-app',
	parameters: {
		cacheControl: 'no-store',
		publicReadAcl: false,
	},
	regions: new Set([region]),
	stacks: new Set([stack]),
});

riffRaff.synth();
