import 'source-map-support/register';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { Duration } from 'aws-cdk-lib';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { ServiceCatalogue } from '../lib/service-catalogue';

const app = new GuRoot();

new ServiceCatalogue(app, 'ServiceCatalogue-PROD', {
	stack: 'deploy',
	stage: 'PROD',
	env: { region: 'eu-west-1' },
});

new ServiceCatalogue(app, 'ServiceCatalogue-CODE', {
	stack: 'deploy',
	stage: 'CODE',
	env: { region: 'eu-west-1' },
	schedule: Schedule.rate(Duration.days(30)),
	rdsDeletionProtection: false,
});
