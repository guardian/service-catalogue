import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CloudQuery } from './cloudquery';

describe('The Cloudquery stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new CloudQuery(app, 'Cloudquery', {
			stack: 'deploy',
			stage: 'TEST',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
