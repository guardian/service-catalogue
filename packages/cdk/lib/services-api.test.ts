import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ServicesApi } from './services-api';

describe('The ServicesAPI stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new ServicesApi(app, 'ServicesApi', {
			stack: 'deploy',
			stage: 'INFRA',
			domainName: 'services.gutools.co.uk',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
