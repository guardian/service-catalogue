import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { CdkMetadata } from '../lib/cdk-metadata';
import { CdkMetadataAccess } from '../lib/roles';

const app = new App();
new CdkMetadata(app, 'CdkMetadata-INFRA', { stack: 'deploy', stage: 'INFRA' });
new CdkMetadataAccess(app, 'CdkMetadataAccess-INFRA', {
	stack: 'PLACEHOLDER',
	stage: 'INFRA',
});
