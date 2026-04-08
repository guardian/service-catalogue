import { spawn } from 'child_process';

export async function main() {
	console.log(`Running prisma migrate deploy`);
	const stdout = await new Promise<string>((resolve, reject) => {
		const proc = spawn('npx', ['prisma', 'migrate', 'deploy'], {
			env: process.env,
		});

		let out = '';
		proc.stdout.on('data', (chunk: Buffer) => {
			out += chunk.toString();
			process.stdout.write(chunk);
		});
		proc.stderr.on('data', (chunk: Buffer) => {
			process.stderr.write(chunk);
		});
		proc.on('error', reject);
		proc.on('close', (code) => {
			if (code === 0) {
				resolve(out);
			} else {
				reject(new Error(`prisma migrate deploy exited with code ${code}`));
			}
		});
	});

	console.log(stdout);
}

void main();
