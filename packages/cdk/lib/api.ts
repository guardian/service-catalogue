import * as fs from 'fs';
import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import type { App } from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { ApiDefinition, SpecRestApi } from 'aws-cdk-lib/aws-apigateway';
import yaml from 'js-yaml';

export class GithubLensApi extends Stack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const openApiYaml = fs.readFileSync('../api/src/openApi.yaml').toString();
		const yamlString = yaml.load(openApiYaml);

		new SpecRestApi(this, 'lens-api', {
			apiDefinition: ApiDefinition.fromInline(yamlString),
		});
	}
}
