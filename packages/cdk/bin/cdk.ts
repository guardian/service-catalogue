import 'source-map-support/register';
import { GuRootExperimental } from '@guardian/cdk/lib/experimental/constructs/root';
import { CloudFormationLens } from '../lib/cloudformation-lens';
import { CloudQuery } from '../lib/cloudquery';
import { Cloudquery as CloudqueryEcs } from '../lib/ecs/cloudquery';
import { GithubLens } from '../lib/github-lens';
import { Repocop } from '../lib/repocop';
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

new CloudFormationLens(app, 'CloudformationLens-INFRA', {
	stack: 'deploy',
	stage: 'INFRA',
	env: { region: 'eu-west-1' },
});

new Repocop(app, 'Repocop-INFRA', {
	stack: 'deploy',
	stage: 'INFRA',
	env: { region: 'eu-west-1' },
});

new CloudQuery(app, 'CloudQuery-INFRA', {
	stack: 'deploy',
	stage: 'INFRA',
	env: { region: 'eu-west-1' },
});

new CloudqueryEcs(app, 'Cloudquery', {
	stack: 'playground',
	stage: 'INFRA',
	env: { region: 'eu-west-1' },
	cloudFormationStackName: 'playground-INFRA-cloudquery',
});
