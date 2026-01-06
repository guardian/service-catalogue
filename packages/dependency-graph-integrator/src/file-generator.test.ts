import fs from 'fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as yaml from 'yaml';
import { createYaml } from './file-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const shouldUpdateSnapshots = process.env.UPDATE_SNAPSHOTS === '1'; // this is set by scripts/test-runner.mjs

function isFileNotFoundError(err: unknown): err is NodeJS.ErrnoException {
	return (
		typeof err === 'object' &&
		err !== null &&
		'code' in err &&
		(err as { code?: unknown }).code === 'ENOENT'
	);
}

async function expectToMatchSnapshot(testName: string, actual: string) {
	const snapshotsDir = path.join(__dirname, '__snapshots__');
	const snapshotFile = path.join(snapshotsDir, `${testName}.snap`);

	await fs.mkdir(snapshotsDir, { recursive: true });

	try {
		const expected = await fs.readFile(snapshotFile, 'utf-8');

		if (!shouldUpdateSnapshots) {
			assert.strictEqual(actual, expected);
			return;
		}
	} catch (err: unknown) {
		if (isFileNotFoundError(err)) {
			await fs.writeFile(snapshotFile, actual, 'utf-8');
			if (!shouldUpdateSnapshots) {
				throw new Error(
					`Snapshot created for "${testName}". Re‑run tests with test:update to accept changes.`,
				);
			}
			return;
		}
		throw err;
	}
	await fs.writeFile(snapshotFile, actual, 'utf-8');
}

void describe('createYaml for sbt', () => {
	void it('should generate the following yaml file', async () => {
		const actual = await createYaml('branch', 'Scala');
		await expectToMatchSnapshot('createYaml-scala', actual);
	});

	void it('has the expected structure (Scala)', async () => {
		const actual = await createYaml('branch', 'Scala');
		const parsed = yaml.parse(actual) as {
			name: string;
			on: { push: { branches: string[] }; workflow_dispatch?: unknown };
			jobs: Record<
				string,
				{
					'runs-on': string;
					permissions: { contents: string };
					steps: Array<{
						id?: string;
						uses?: string;
						run?: string;
						with?: Record<string, unknown>;
					}>;
				}
			>;
		};

		// top-level
		assert.strictEqual(parsed.name, 'Update Dependency Graph for sbt');
		assert.deepStrictEqual(parsed.on.push.branches, ['main', 'branch']);
		assert.ok(parsed.on.workflow_dispatch !== undefined);

		// job
		const job = parsed.jobs['dependency-graph'];
		assert.ok(job, 'dependency-graph job should exist');
		assert.strictEqual(job['runs-on'], 'ubuntu-latest');
		assert.deepStrictEqual(job.permissions, { contents: 'write' });

		// steps
		assert.ok(Array.isArray(job.steps), 'steps should be an array');
		assert.ok(job.steps.length >= 5, 'should have at least 5 steps');

		const checkout = job.steps.find(
			(s: unknown): s is { id?: string; uses?: string } =>
				typeof s === 'object' &&
				s !== null &&
				'id' in s &&
				typeof (s as { id?: unknown }).id === 'string' &&
				'uses' in s,
		) as { id?: string; uses?: string } | undefined;
		assert.ok(checkout, 'checkout step missing');
		assert.match(checkout.uses!, /^actions\/checkout@/);

		const java = job.steps.find(
			(
				s: unknown,
			): s is { id?: string; uses?: string; with?: Record<string, unknown> } =>
				typeof s === 'object' &&
				s !== null &&
				'id' in s &&
				typeof (s as { id?: unknown }).id === 'string' &&
				'uses' in s &&
				'with' in s,
		) as
			| { id?: string; uses?: string; with?: Record<string, unknown> }
			| undefined;
		assert.ok(java, 'java step missing');
		assert.match(java.uses!, /^actions\/setup-java@/);
		assert.ok(java.with, 'java.with should be defined');
		assert.strictEqual(java.with['java-version'], 21);
		assert.strictEqual(java.with.distribution, 'temurin');

		const sbtStep = job.steps.find(
			(s): s is { id?: string; uses?: string } =>
				typeof s === 'object' && (s as { id?: string }).id === 'sbt',
		);
		assert.ok(sbtStep, 'sbt step missing');
		assert.match(sbtStep.uses!, /^sbt\/setup-sbt@/);

		const submit = job.steps.find(
			(s): s is { id?: string; uses?: string } =>
				typeof s === 'object' && (s as { id?: string }).id === 'submit',
		);
		assert.ok(submit, 'submit step missing');
		assert.match(submit.uses!, /^scalacenter\/sbt-dependency-submission@/);

		const validate = job.steps.find(
			(s: unknown): s is { id?: string; run?: string } =>
				typeof s === 'object' &&
				s !== null &&
				'id' in s &&
				typeof (s as { id?: unknown }).id === 'string' &&
				'run' in s,
		) as { id?: string; run?: string } | undefined;
		assert.ok(validate, 'validate step missing');
		assert.match(
			validate.run!,
			/^cat \$\{\{ steps\.submit\.outputs\.snapshot-json-path \}\} \| jq$/,
		);
	});
});

void describe('createYaml for Kotlin', () => {
	void it('matches snapshot', async () => {
		const actual = await createYaml('branch', 'Kotlin');
		await expectToMatchSnapshot('createYaml-kotlin', actual);
	});

	void it('has the expected structure (Kotlin)', async () => {
		const actual = await createYaml('branch', 'Kotlin');
		const parsed = yaml.parse(actual) as {
			name: string;
			on: { push: { branches: string[] }; workflow_dispatch?: unknown };
			jobs: Record<
				string,
				{
					'runs-on': string;
					permissions: { contents: string };
					steps: Array<{ id?: string; uses?: string; run?: string }>;
				}
			>;
		};

		assert.strictEqual(parsed.name, 'Update Dependency Graph for Gradle');
		assert.deepStrictEqual(parsed.on.push.branches, ['main', 'branch']);
		assert.ok(parsed.on.workflow_dispatch !== undefined);

		const job = parsed.jobs['dependency-graph'];
		assert.ok(job, 'dependency-graph job should exist');
		assert.strictEqual(job['runs-on'], 'ubuntu-latest');
		assert.deepStrictEqual(job.permissions, { contents: 'write' });

		assert.ok(Array.isArray(job.steps), 'steps should be an array');
		assert.ok(job.steps.length >= 3, 'should have at least 3 steps');

		const setupStep = job.steps.find((s) => s.id === 'setup');
		assert.ok(setupStep, 'setup step missing');
		assert.match(setupStep.uses!, /^actions\/setup-java@/);

		const submitStep = job.steps.find((s) => s.id === 'submit');
		assert.ok(submitStep, 'submit step missing');
		assert.match(submitStep.uses!, /^gradle\/actions\/dependency-submission@/);

		const validateStep = job.steps.find((s) => s.id === 'validate');
		assert.ok(validateStep, 'validate step missing');
		assert.match(
			validateStep.run!,
			/^cat "\$GITHUB_WORKSPACE\/dependency-graph-reports\/update_dependency_graph_for_gradle-dependency-graph\.json" \| jq$/,
		);
	});
});
