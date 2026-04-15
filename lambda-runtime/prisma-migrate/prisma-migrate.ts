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
};

type DatabaseConnection = {
	url: string;
	host: string;
};

async function getDatabaseUrl(): Promise<DatabaseConnection> {
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

	const secret = JSON.parse(response.SecretString) as DatabaseSecret;

	return {
		url: `postgresql://${encodeURIComponent(secret.username)}:${encodeURIComponent(secret.password)}@${encodeURIComponent(secret.host)}:${secret.port}/postgres?schema=public&sslmode=verify-full&connection_limit=20&pool_timeout=20`,
		host: secret.host,
	};
}

export async function main() {
	console.log('Running prisma migrate deploy');

	const { url, host } = await getDatabaseUrl();

	const redact = (s: string) =>
		s.replace(url, '[REDACTED]').replace(host, '[REDACTED]');
	const cwd = process.cwd();
	const prismaCli = path.join(
		cwd,
		'node_modules',
		'prisma',
		'build',
		'index.js',
	);
	const schemaPath = path.join(cwd, 'prisma', 'schema.prisma');
	const configPath = path.join(cwd, 'dist', 'prisma.lambda.config.js');

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
					DATABASE_URL: url,
				},
			},
		);

		let out = '';
		let err = '';
		proc.stdout.on('data', (chunk: Buffer) => (out += chunk.toString()));
		proc.stderr.on('data', (chunk: Buffer) => (err += chunk.toString()));
		proc.on('error', reject);
		proc.on('close', (code) => {
			if (code === 0) {
				resolve(out);
			} else {
				reject(
					new Error(
						`prisma migrate deploy exited with code ${code}\n\nSTDOUT:\n${redact(out)}\n\nSTDERR:\n${redact(err)}`,
					),
				);
			}
		});
	});

	console.log(redact(stdout));
}
