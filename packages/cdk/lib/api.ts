import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import type { App } from 'aws-cdk-lib';
import {Stack} from "aws-cdk-lib";
import {ApiDefinition, SpecRestApi} from "aws-cdk-lib/aws-apigateway";
import * as fs from "fs";
import yaml from "js-yaml"


export class GithubLensApi extends Stack {
    constructor(scope: App, id: string, props: GuStackProps) {

        super(scope, id, props);

        //this constant also exists in github-lens.ts and should probably be pulled out.
        const app = 'github-lens';

        const yamlString = yaml.load(fs.readFileSync('../api/src/openapi.yaml').toString())

        const api = new SpecRestApi(this, 'lens-api', {
            apiDefinition: ApiDefinition.fromInline(yamlString)
        });

    }
}
