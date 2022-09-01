import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { CdkMetadata } from '../lib/cdk-metadata';
import { CdkMetadataAccess } from '../lib/roles';

const app = new App();
new CdkMetadata(app, 'CdkMetadata-INFRA', { stack: 'deploy', stage: 'INFRA' });
new CdkMetadataAccess(app, 'CdkMetadataAccess-INFRA', {
	// TODO at the moment we treat this as a placeholder and use a Stack
	// parameter (which RR automatically populates) to handle multiple stacks.
	// Once @actions-riff-raff supports contentDirectory
	// (https://github.com/guardian/actions-riff-raff/issues/13) we should use
	// GuRootExperimental instead here and drop the Stack parameter in favour of
	// generating a template per stack.
	stack: 'PLACEHOLDER',
	stage: 'INFRA',
});
