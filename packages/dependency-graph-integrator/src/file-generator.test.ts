import fs from 'fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import yaml from 'yaml';
import { createYaml } from './file-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const shouldUpdateSnapshots = process.env.UPDATE_SNAPSHOTS === 'true'; // this is set by scripts/test-runner.mjs

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
					`Snapshot created for "${testName}".  Re-run tests to use the new snapshot`,
				);
			}
			return;
		}
		throw err;
	}
	await fs.writeFile(snapshotFile, actual, 'utf-8');
}

// Load the same template file used by createYaml, to derive shared vs language steps.
async function loadTemplateWorkflow() {
	const repoTemplatePath = path.resolve(
		__dirname,
		'../../../.github/workflows/template_dependency_submission.yaml',
	);
	const content = await fs.readFile(repoTemplatePath, 'utf-8');
	return yaml.parse(content) as {
		jobs: Record<string, { steps: unknown[] }>;
	};
}

async function expectSharedStepsPrepended(language: 'Scala' | 'Kotlin') {
	const template = await loadTemplateWorkflow();
	const sharedSteps = template.jobs['shared-steps']?.steps ?? [];
	const jobKey = `${language.toLowerCase()}-job`;
	const languageSteps = template.jobs[jobKey]?.steps ?? [];

	const out = await createYaml('branch', language);
	const parsed = yaml.parse(out) as {
		jobs: { 'dependency-graph': { steps: unknown[] } };
	};
	const actualSteps = parsed.jobs['dependency-graph'].steps;

	// 1) Shared steps are at the beginning and unchanged (comments are ignored by the parser).
	assert.deepStrictEqual(
		actualSteps.slice(0, sharedSteps.length),
		sharedSteps,
		`Shared steps must be prepended for ${language}`,
	);

	// 2) The language-specific steps follow immediately and in the same order as template.
	assert.deepStrictEqual(
		actualSteps.slice(sharedSteps.length),
		languageSteps,
		`Language steps must follow shared steps for ${language}`,
	);
}

void describe('createYaml for sbt', () => {
	// Snapshot: full, exact YAML contract (ordering, comments, formatting).
	void it('matches snapshot (Scala)', async () => {
		const actual = await createYaml('branch', 'Scala');
		await expectToMatchSnapshot('create-yaml-scala', actual);
	});

	// Minimal semantic assertion: shared steps are prepended.
	void it('prepends shared steps ahead of language steps (Scala)', async () => {
		await expectSharedStepsPrepended('Scala');
	});
});

void describe('createYaml for Kotlin', () => {
	// Snapshot: full, exact YAML contract.
	void it('matches snapshot (Kotlin)', async () => {
		const actual = await createYaml('branch', 'Kotlin');
		await expectToMatchSnapshot('create-yaml-kotlin', actual);
	});

	// Minimal semantic assertion: shared steps are prepended.
	void it('prepends shared steps ahead of language steps (Kotlin)', async () => {
		await expectSharedStepsPrepended('Kotlin');
	});
});
