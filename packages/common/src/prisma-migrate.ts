import { spawn } from 'child_process';

export async function main() {
	console.log(`Running prisma migrate deploy`);
	const stdout = await new Promise<string>((resolve, reject) => {
		const proc = spawn('./node_modules/.bin/prisma', ['migrate', 'deploy'], {
			env: process.env,
		});

		let out = '';
		let err = '';
		proc.stdout.on('data', (chunk: Buffer) => {
			out += chunk.toString();
			process.stdout.write(chunk);
		});
		proc.stderr.on('data', (chunk: Buffer) => {
			err += chunk.toString();
			process.stderr.write(chunk);
		});
		proc.on('error', (e) => reject(e));
		proc.on('close', (code) => {
			if (code === 0) {
				resolve(out);
			} else {
				reject(
					new Error(
						`prisma migrate deploy exited with code ${code}\n\nSTDOUT:\n${out}\n\nSTDERR:\n${err}`,
					),
				);
			}
		});
	});

	console.log(stdout);
}

void main();
