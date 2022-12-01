import 'source-map-support/register.js';
import { GuRootExperimental } from '@guardian/cdk/lib/experimental/constructs/root.js';
import { CloudFormationLens } from '../lib/cloudformation-lens.js';
import { GithubLens } from '../lib/github-lens.js';
import { ServicesApi } from '../lib/services-api.js';

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

new CloudFormationLens(app, 'CloudformationLens-INFRA', {
	stack: 'deploy',
	stage: 'INFRA',
	env: { region: 'eu-west-1' },
});
