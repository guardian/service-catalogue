import 'source-map-support/register';
import { GuRootExperimental } from '@guardian/cdk/lib/experimental/constructs/root';
import { CloudQuery } from '../lib/cloudquery';

const app = new GuRootExperimental();

new CloudQuery(app, 'CloudQuery-INFRA', {
	stack: 'deploy',
	stage: 'INFRA',
	env: { region: 'eu-west-1' },
});
