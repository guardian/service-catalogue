import { spawn } from 'child_process';
import path from 'path';
import {
	GetSecretValueCommand,
	SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

type DatabaseSecret = {
	username: string;
	password: string;
	host: string;
	port: number;
	dbname: string;
};

async function getDatabaseSecret(): Promise<DatabaseSecret> {
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
	return JSON.parse(response.SecretString) as DatabaseSecret;
}

export async function main() {
	console.log('Running prisma migrate deploy');

	const secret = await getDatabaseSecret();
	const cwd = process.cwd();
	const prismaCli = path.join(
		cwd,
		'node_modules',
		'prisma',
		'build',
		'index.js',
	);
	const schemaPath = path.join(cwd, 'prisma', 'schema.prisma');
	const configPath = path.join(cwd, 'dist', 'prisma.config.js');

	const stdout = await new Promise<string>((resolve, reject) => {
		const proc = spawn(
			process.execPath,
			[
				prismaCli,
				'migrate',
				'deploy',
				'--schema',
				schemaPath,
				'--config',
				configPath,
			],
			{
				cwd,
				env: {
					...process.env,
					DATABASE_HOSTNAME: secret.host,
					DATABASE_USER: secret.username,
					DATABASE_PASSWORD: secret.password,
				},
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
