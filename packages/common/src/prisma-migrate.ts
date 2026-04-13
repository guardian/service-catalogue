import { spawn } from 'child_process';
import path from 'path';
import {
	GetSecretValueCommand,
	SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

async function getDatabaseUrl(): Promise<string> {
	const secretArn = process.env.DB_SECRET_ARN;
	if (!secretArn) {
		throw new Error('DB_SECRET_ARN env var is not set');
	}

	const client = new SecretsManagerClient({});
	const response = await client.send(
		new GetSecretValueCommand({ SecretId: secretArn }),
	);

	if (!response.SecretString) {
		throw new Error('Secret has no SecretString');
	}

	const secret = JSON.parse(response.SecretString) as {
		username: string;
		password: string;
		host: string;
		port: number;
		dbname: string;
	};

	return `postgresql://${secret.username}:${encodeURIComponent(secret.password)}@${secret.host}:${secret.port}/${secret.dbname}`;
}

export async function main() {
	console.log('Running prisma migrate deploy');

	const databaseUrl = await getDatabaseUrl();
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
			{
				env: { ...process.env, DATABASE_URL: databaseUrl },
				cwd,
			},
		);

		let out = '';
		let err = '';
		proc.stdout.on('data', (chunk: Buffer) => (out += chunk.toString()));
		proc.stderr.on('data', (chunk: Buffer) => (err += chunk.toString()));
		proc.on('error', reject);
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
