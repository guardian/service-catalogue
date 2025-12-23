import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const update = args.includes('-u') || args.includes('--update-snapshots');
const passthrough = args.filter(
	(a) => a !== '-u' && a !== '--update-snapshots',
);

const child = spawn(
	process.execPath,
	['--import', 'tsx', '--test', '**/*.test.ts', ...passthrough],
	{
		stdio: 'inherit',
		env: {
			...process.env,
			UPDATE_SNAPSHOTS: update ? '1' : process.env.UPDATE_SNAPSHOTS,
		},
	},
);

child.on('exit', (code) => process.exit(code ?? 1));
