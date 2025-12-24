#!/usr/bin/env node
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const update = args.includes('-u') || args.includes('--update-snapshots');
const userArgs = args.filter((a) => a !== '-u' && a !== '--update-snapshots');

// Prefer spec locally, TAP in CI
const reporter = process.env.CI ? 'tap' : 'spec';

const child = spawn(
	process.execPath,
	[
		'--import',
		'tsx',
		'--test',
		'--test-reporter',
		reporter,
		'**/*.test.ts',
		...userArgs,
	],
	{
		stdio: 'inherit',
		env: {
			...process.env,
			TZ: 'UTC',
			LANG: 'C',
			LC_ALL: 'C',
			UPDATE_SNAPSHOTS: update ? '1' : process.env.UPDATE_SNAPSHOTS,
		},
	},
);

child.on('exit', (code) => process.exit(code ?? 1));
