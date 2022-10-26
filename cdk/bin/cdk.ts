import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { CdkMetadata } from '../lib/cdk-metadata';

const app = new App();
new CdkMetadata(app, 'CdkMetadata-INFRA', { stack: 'deploy', stage: 'INFRA' });
