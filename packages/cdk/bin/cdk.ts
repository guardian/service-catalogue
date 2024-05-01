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

// Add additional S3 deployment types and synth riff-raff.yml
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
});

deployments.set('theguardian-obligationsdashboard-app', {
	type: 'aws-s3',
	contentDirectory: 'theguardian-obligationsdashboard-app',
	app: 'theguardian-obligationsdashboard-app',
	parameters: {
		cacheControl: 'no-store',
		publicReadAcl: false,
	},
	regions: new Set([region]),
	stacks: new Set([stack]),
});

riffRaff.synth();
