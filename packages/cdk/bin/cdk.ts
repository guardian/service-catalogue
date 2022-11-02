import 'source-map-support/register';
import { GuRootExperimental } from '@guardian/cdk/lib/experimental/constructs/root';
import { GithubLens } from '../lib/github-lens';

const app = new GuRootExperimental();

new GithubLens(app, 'GithubLens-INFRA', {
	stack: 'deploy',
	stage: 'INFRA',
	env: { region: 'eu-west-1' },
	domainName: 'github-lens.gutools.co.uk',
	vpceId: 'vpce-04f40fb1a4a0a23a6',
});
