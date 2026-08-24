import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import {
	buildCliDeveloperPolicy,
	buildRunLocallyDeveloperPolicy,
} from './developer-policy';

describe('Developer policies for the ServiceCatalogue stack', () => {
	it('CLI developer policy', () => {
		const app = new App();

		const stack = new GuStack(app, 'test-stack', {
			stack: 'deploy',
			stage: 'TEST',
			app: 'service-catalogue',
		});

		buildCliDeveloperPolicy(stack);

		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});

	it('local run developer policy', () => {
		const app = new App();

		const stack = new GuStack(app, 'test-stack', {
			stack: 'deploy',
			stage: 'TEST',
			app: 'service-catalogue',
		});

		const cloudqueryApiKey = new Secret(stack, 'cloudqueryApiKey', {});
		const cloudqueryGithubCredentials = new Secret(
			stack,
			'cloudqueryGithubCredentials',
			{},
		);

		buildRunLocallyDeveloperPolicy(stack, {
			cloudqueryApiKey,
			cloudqueryGithubCredentials,
		});

		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
