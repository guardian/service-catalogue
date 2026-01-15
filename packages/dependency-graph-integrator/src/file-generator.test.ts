import fs from 'fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import type { DepGraphLanguage } from 'common/types.js';
import yaml from 'yaml';
import { createYaml } from './file-generator.js';

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
	const moduleDirPath = path.dirname(fileURLToPath(import.meta.url));

	const snapshotsDir = path.join(moduleDirPath, '__snapshots__');

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

async function loadYamlTemplateObject(language: DepGraphLanguage) {
	const moduleDirPath = path.dirname(fileURLToPath(import.meta.url));

	const templateName =
		language === 'Scala'
			? 'template_dep_submission_sbt.yaml'
			: 'template_dep_submission_gradle.yaml';

	const bundledTemplatePath = path.resolve(moduleDirPath, templateName);

	const template = await fs.readFile(bundledTemplatePath, 'utf-8');

	// parse into a plain JS object for semantic comparison
	return yaml.parse(template) as {
		jobs: Record<string, { steps: unknown[] }>;
	};
}

async function expectStepsMatchTemplate(language: DepGraphLanguage) {
	const template = await loadYamlTemplateObject(language);
	const templateSteps = template.jobs['dependency-graph']?.steps ?? [];

	const out = await createYaml('branch', language);
	const parsed = yaml.parse(out) as {
		jobs: { 'dependency-graph': { steps: unknown[] } };
	};
	const actualSteps = parsed.jobs['dependency-graph'].steps;

	// The generated dependency-graph steps must match the language-specific template exactly.
	assert.deepStrictEqual(
		actualSteps,
		templateSteps,
		`dependency-graph steps must match the ${language} template`,
	);
}

void describe('createYaml for sbt', () => {
	// Snapshot: full, exact YAML contract (ordering, comments, formatting).
	void it('matches snapshot (Scala)', async () => {
		const actual = await createYaml('branch', 'Scala');
		await expectToMatchSnapshot('create-yaml-scala', actual);
	});

	// Minimal semantic assertion: generated steps match the sbt template.
	void it('generates steps that match the sbt template (Scala)', async () => {
		await expectStepsMatchTemplate('Scala');
	});
});

void describe('createYaml for Kotlin', () => {
	// Snapshot: full, exact YAML contract.
	void it('matches snapshot (Kotlin)', async () => {
		const actual = await createYaml('branch', 'Kotlin');
		await expectToMatchSnapshot('create-yaml-kotlin', actual);
	});

	// Minimal semantic assertion: generated steps match the gradle template.
	void it('generates steps that match the gradle template (Kotlin)', async () => {
		await expectStepsMatchTemplate('Kotlin');
	});
});
