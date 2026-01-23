import fs from 'fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
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

void describe('createYaml for sbt', () => {
	void it('matches snapshot (Scala)', async () => {
		const actual = await createYaml('branch', 'Scala');
		await expectToMatchSnapshot('create-yaml-scala', actual);
	});
});

void describe('createYaml for Kotlin', () => {
	void it('matches snapshot (Kotlin)', async () => {
		const actual = await createYaml('branch', 'Kotlin');
		await expectToMatchSnapshot('create-yaml-kotlin', actual);
	});
});
