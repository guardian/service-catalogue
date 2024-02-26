import fs from 'fs';
import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { GithubWorkflow } from './transform';
import { getUsesInWorkflowTemplate, getWorkflowTemplate } from './transform';

const readWorkflowFile = (path: string): string =>
	fs.readFileSync(`test/fixtures/${path}`, 'utf8');

void describe('getWorkflowTemplate', () => {
	void test('Workflow with single job, and multiple steps is recognised', async () => {
		const path = 'multi-step-workflow.yml';
		const contents = readWorkflowFile(path);

		const actual = await getWorkflowTemplate({
			full_name: 'guardian/fake-repo',
			path: `.github/workflows/${path}`,
			contents,
		});

		// `getWorkflowTemplate` returns `undefined` if the workflow is invalid.
		// Therefore, a valid workflow should not be `undefined`
		assert.notDeepEqual(actual, undefined);
	});

	void test('Invalid workflow is not recognised', async () => {
		const path = 'invalid-workflow.yml';
		const contents = readWorkflowFile(path);

		const actual = await getWorkflowTemplate({
			full_name: 'guardian/fake-repo',
			path: `.github/workflows/${path}`,
			contents,
		});

		// `getWorkflowTemplate` returns `undefined` if the workflow is invalid.
		assert.deepEqual(actual, undefined);
	});
});

void describe('getUsesInmWorkflowTemplate', () => {
	void test('Workflow with single job, and multiple steps', async () => {
		const path = 'multi-step-workflow.yml';
		const contents = readWorkflowFile(path);

		const workflow = (await getWorkflowTemplate({
			full_name: 'guardian/fake-repo',
			path: `.github/workflows/${path}`,
			contents,
		})) as GithubWorkflow;

		const uses = getUsesInWorkflowTemplate(workflow.template);

		assert.deepEqual(uses, [
			'actions/checkout@v4',
			'actions/setup-node@v4',
			'actions/setup-java@v4',
		]);
	});

	void test('Workflow with multiple jobs, and complex steps', async () => {
		const path = 'complex-workflow.yml';
		const contents = readWorkflowFile(path);

		const workflow = (await getWorkflowTemplate({
			full_name: 'guardian/fake-repo',
			path: `.github/workflows/${path}`,
			contents,
		})) as GithubWorkflow;

		const uses = getUsesInWorkflowTemplate(workflow.template);

		assert.deepEqual(uses, [
			'actions/checkout@v4',
			'actions/setup-node@v4',
			'actions/setup-java@v4',
			'guardian/.github/.github/workflows/sbt-node-snyk.yml@main',
		]);
	});
});
