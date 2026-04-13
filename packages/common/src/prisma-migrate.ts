import { spawn } from 'child_process';
import path from 'path';

export async function main() {
	console.log(`Running prisma migrate deploy`);
	const cwd = process.cwd();
	const prismaCli = path.join(
		cwd,
		'node_modules',
		'prisma',
		'build',
		'index.js',
	);
	const schemaPath = path.join(cwd, 'prisma', 'schema.prisma');

	const stdout = await new Promise<string>((resolve, reject) => {
		const proc = spawn(
			process.execPath,
			[prismaCli, 'migrate', 'deploy', '--schema', schemaPath],
			{ env: process.env, cwd },
		);

		let out = '';
		let err = '';
		proc.stdout.on('data', (chunk: Buffer) => {
			out += chunk.toString();
		});
		proc.stderr.on('data', (chunk: Buffer) => {
			err += chunk.toString();
		});
		proc.on('error', (e) => reject(e));
		proc.on('close', (code) =>
			code === 0
				? resolve(out)
				: reject(
						new Error(
							`prisma migrate deploy exited with code ${code}\n\nSTDOUT:\n${out}\n\nSTDERR:\n${err}`,
						),
					),
		);
	});

	console.log(stdout);
}
