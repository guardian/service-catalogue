import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Cloudquery } from './cloudquery';

describe('The Cloudquery stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new Cloudquery(app, 'Cloudquery', {
			stack: 'playground',
			stage: 'TEST',
			env: {
				region: 'eu-west-1',
			},
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
