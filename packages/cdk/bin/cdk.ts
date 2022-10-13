import 'source-map-support/register';
import { GithubLens } from '../lib/github-lens';

import { GuRootExperimental } from "@guardian/cdk/lib/experimental/constructs/root";

const app = new GuRootExperimental();

new GithubLens(app, "GithubLens-INFRA", {stack: 'deploy', stage: 'INFRA', env:{region: "eu-west-1"} });
//new GithubLens(app, "my-stack-PROD", {stack: 'deploy', stage: 'PROD'});