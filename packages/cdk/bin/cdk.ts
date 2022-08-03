import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { GithubLens } from '../lib/github-lens';

const app = new App();
new GithubLens(app, 'GithubLens-CODE', { stack: 'deploy', stage: 'CODE' });
