import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { GithubLens } from './github-lens';

describe('The GithubLens stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new GithubLens(app, 'GithubLens', {
			stack: 'deploy',
			stage: 'INFRA',
			domainName: 'github-lens.gutools.co.uk',
			vpceId: 'PLACEHOLDER',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
