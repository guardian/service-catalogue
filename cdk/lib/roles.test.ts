import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CdkMetadataAccess } from './roles';

describe('The Roles stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new CdkMetadataAccess(app, 'roles', {
			stack: 'deploy',
			stage: 'TEST',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
