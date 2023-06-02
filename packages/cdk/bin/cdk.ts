import 'source-map-support/register';
import { GuRootExperimental } from '@guardian/cdk/lib/experimental/constructs/root';
import { CloudQuery } from '../lib/cloudquery';
import { Repocop } from '../lib/repocop';

const app = new GuRootExperimental();

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
