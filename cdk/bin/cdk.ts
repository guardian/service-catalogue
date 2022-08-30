import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { CdkMetadata } from '../lib/cdk-metadata';
import { CdkMetadataAccess } from '../lib/roles';

const app = new App();
new CdkMetadata(app, 'CdkMetadata-INFRA', { stack: 'deploy', stage: 'INFRA' });
new CdkMetadataAccess(app, 'CdkMetadataAccess-INFRA', {
	stack: 'PLACEHOLDER', // Ignored in favour of Stack (Cfn) parameter to share template across the many stacks.
	stage: 'INFRA',
});
