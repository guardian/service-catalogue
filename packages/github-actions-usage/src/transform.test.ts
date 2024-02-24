import { stripMargin } from 'common/src/string';
import type { RawGithubWorkflow } from './db-read';
import type { GithubWorkflowFile } from './transform';
import { getUsesStringsFromWorkflow, validateRawWorkflow } from './transform';

describe('getUsesStringsFromWorkflow', () => {
	test('Workflow with single job, and multiple steps', () => {
		const workflow: GithubWorkflowFile = {
			jobs: {
				build: {
					steps: [
						{
							uses: 'actions/checkout@v4',
						},
						{
							uses: 'actions/setup-node@v4',
						},
					],
				},
			},
		};
		expect(getUsesStringsFromWorkflow(workflow)).toEqual([
			'actions/checkout@v4',
			'actions/setup-node@v4',
		]);
	});

	test('Workflow with single job, and single step', () => {
		const workflow: GithubWorkflowFile = {
			jobs: {
				security: {
					uses: 'guardian/.github/.github/workflows/sbt-node-snyk.yml@main',
				},
			},
		};
		expect(getUsesStringsFromWorkflow(workflow)).toEqual([
			'guardian/.github/.github/workflows/sbt-node-snyk.yml@main',
		]);
	});

	test('Workflow with multiple jobs, and a variety of steps', () => {
		const workflow: GithubWorkflowFile = {
			jobs: {
				validate: {
					steps: [
						{
							uses: 'actions/checkout@v4',
						},
						{
							uses: 'nrwl/nx-set-shas@v4',
						},
						{
							uses: './.github/actions/setup-node-env',
						},
					],
				},
				chromatic: {
					uses: './.github/workflows/chromatic.yml',
				},
			},
		};
		expect(getUsesStringsFromWorkflow(workflow)).toEqual([
			'actions/checkout@v4',
			'nrwl/nx-set-shas@v4',
			'./.github/actions/setup-node-env',
			'./.github/workflows/chromatic.yml',
		]);
	});
});

describe('validateRawWorkflow', () => {
	test('return value when content is valid', () => {
		const workflow: RawGithubWorkflow = {
			full_name: 'guardian/fake-repo',
			path: '.github/workflows/ci.yml',
			contents: stripMargin`
				|name: Snyk
				|on:
				|  push:
				|    branches:
				|      - main
				|  workflow_dispatch:
				|
				|jobs:
				|  security:
				|    uses: guardian/.github/.github/workflows/sbt-node-snyk.yml@main
				|    with:
				|      ORG: guardian-devtools
				|      SKIP_SBT: true
				|    secrets:
				|      SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
				|`,
		};
		expect(validateRawWorkflow(workflow)).toEqual({
			repository: 'guardian/fake-repo',
			path: '.github/workflows/ci.yml',
			content: {
				name: 'Snyk',
				on: {
					push: {
						branches: ['main'],
					},
					workflow_dispatch: null,
				},
				jobs: {
					security: {
						uses: 'guardian/.github/.github/workflows/sbt-node-snyk.yml@main',
						with: {
							ORG: 'guardian-devtools',
							SKIP_SBT: true,
						},
						secrets: {
							SNYK_TOKEN: '${{ secrets.SNYK_TOKEN }}',
						},
					},
				},
			},
		});
	});

	test('return value when content is YAML, but not a valid GitHub Workflow', () => {
		const workflow: RawGithubWorkflow = {
			full_name: 'guardian/fake-repo',
			path: '.github/workflows/ci.yml',
			contents: stripMargin`
				|name: Snyk
				|on:
				|  push:
				|    branches:
				|      - main
				|  workflow_dispatch:
				|
				|fakeKey: fakeValue
				|
				|jobs:
				|  security:
				|    uses: guardian/.github/.github/workflows/sbt-node-snyk.yml@main
				|    with:
				|      ORG: guardian-devtools
				|      SKIP_SBT: true
				|    secrets:
				|      SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
				|`,
		};
		expect(validateRawWorkflow(workflow)).toBeUndefined();
	});

	test('return value when content is not YAML', () => {
		const workflow: RawGithubWorkflow = {
			full_name: 'guardian/fake-repo',
			path: '.github/workflows/ci.yml',
			contents: 'I am not YAML',
		};
		expect(validateRawWorkflow(workflow)).toBeUndefined();
	});
});
