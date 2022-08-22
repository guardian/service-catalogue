import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CdkMetadata } from './cdk-metadata';

describe('The CdkMetadata stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new CdkMetadata(app, 'CdkMetadata', {
			stack: 'deploy',
			stage: 'TEST',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
