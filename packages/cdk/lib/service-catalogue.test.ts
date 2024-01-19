import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ServiceCatalogue } from './service-catalogue';

describe('The ServiceCatalogue stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new ServiceCatalogue(app, 'ServiceCatalogue', {
			stack: 'deploy',
			stage: 'TEST',
			steampipeDomainName: 'steampipe.code.dev-gutools.co.uk',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
