import 'source-map-support/register';
import { GuRootExperimental } from '@guardian/cdk/lib/experimental/constructs/root';
import { GithubLens } from '../lib/github-lens';
import { ServicesApi } from '../lib/services-api';

const app = new GuRootExperimental();

new GithubLens(app, 'GithubLens-INFRA', {
	stack: 'deploy',
	stage: 'INFRA',
	env: { region: 'eu-west-1' },
	domainName: 'github-lens.gutools.co.uk',
});

new ServicesApi(app, 'ServicesApi-INFRA', {
	stack: 'deploy',
	stage: 'INFRA',
	env: { region: 'eu-west-1' },
	domainName: 'services.gutools.co.uk',
});
