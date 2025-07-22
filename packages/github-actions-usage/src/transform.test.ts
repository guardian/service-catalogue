import fs from 'fs';
import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { GithubWorkflow } from './transform.js';
import {
	getUsesInWorkflowTemplate,
	getWorkflowTemplate,
	removeUndefined,
} from './transform.js';

const readWorkflowFile = (path: string): string =>
	fs.readFileSync(`test/fixtures/${path}`, 'utf8');

void describe('removeUndefined', () => {
	void test('removes undefined values from an array', () => {
		const input = [1, undefined, 2, undefined, 3];
		const expected = [1, 2, 3];
		const actual = removeUndefined(input);
		assert.deepEqual(actual, expected);
	});
	void test('returns an empty array if all values are undefined', () => {
		const input = [undefined, undefined, undefined];
		const expected: unknown[] = [];
		const actual = removeUndefined(input);
		assert.deepEqual(actual, expected);
	});
	void test('return the same array when no undefined values are present', () => {
		const input = [1, 2, 3];
		const expected = [1, 2, 3];
		const actual = removeUndefined(input);
		assert.deepEqual(actual, expected);
	});
});

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
