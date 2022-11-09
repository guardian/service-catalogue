import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CloudFormationLens } from './cloudformation-lens';

describe('The CloudFormation Lens stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new CloudFormationLens(app, 'CloudFormationLens', {
			stack: 'deploy',
			stage: 'TEST',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
