import 'source-map-support/register';
import { RiffRaffYamlFile } from '@guardian/cdk/lib/riff-raff-yaml-file';
import { App, Duration } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';
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
	securityAlertSchedule: Schedule.cron({
		weekDay: 'MON-FRI',
		hour: '3',
		minute: '0',
	}),
	enableCloudquerySchedules: true,
	instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.XLARGE),
});

new ServiceCatalogue(app, 'ServiceCatalogue-CODE', {
	stack,
	stage: 'CODE',
	env: { region },
	securityAlertSchedule: Schedule.rate(Duration.days(30)),
	rdsDeletionProtection: false,
	cloudFormationStackName: 'deploy-CODE-service-catalogue',

	// Do not run CloudQuery tasks in CODE, preferring instead to run them manually using the CLI.
	enableCloudquerySchedules: false,
	instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
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

riffRaff.synth();
