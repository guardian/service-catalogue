import 'source-map-support/register';
import { GuRootExperimental } from '@guardian/cdk/lib/experimental/constructs/root';
import { ServiceCatalogue } from '../lib/service-catalogue';

const app = new GuRootExperimental();

new ServiceCatalogue(app, 'ServiceCatalogue-INFRA', {
	stack: 'deploy',
	stage: 'INFRA',
	env: { region: 'eu-west-1' },
});

new ServiceCatalogue(app, 'ServiceCatalogue-CODE', {
	stack: 'deploy',
	stage: 'CODE',
	env: { region: 'eu-west-1' },
});
