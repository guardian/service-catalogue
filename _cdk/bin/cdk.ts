import 'source-map-support/register';
import { GuRootExperimental } from '@guardian/cdk/lib/experimental/constructs/root';
import { CloudFormationLens } from '../lib/cloudformation-lens';

const app = new GuRootExperimental();
new CloudFormationLens(app, 'CloudformationLens-INFRA', {
	stack: 'deploy',
	stage: 'INFRA',
	env: { region: 'eu-west-1' },
});
