import type { GithubWorkflowFile } from './transform';
import { getUsesStringsFromWorkflow } from './transform';

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
