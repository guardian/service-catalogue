import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Repocop } from './repocop';

describe('The Repocop stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new Repocop(app, 'GithubLens', {
			stack: 'deploy',
			stage: 'INFRA',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
