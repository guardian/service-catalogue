import 'source-map-support/register';
import { GuRootExperimental } from '@guardian/cdk/lib/experimental/constructs/root';
import { CdkMetadata } from '../lib/cdk-metadata';

const app = new GuRootExperimental();
new CdkMetadata(app, 'CdkMetadata-INFRA', {
	stack: 'deploy',
	stage: 'INFRA',
	env: { region: 'eu-west-1' },
});
