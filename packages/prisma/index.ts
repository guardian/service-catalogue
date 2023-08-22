import { PrismaClient } from '@prisma/client';
import type { GitHubRepositories, GitHubRepositoryBranches } from './model';
import { repository01, repository02 } from './repositoryRuleEvaluation';
import {Datasources} from "@prisma/client/runtime/library";
import * as process from "process";
import { Signer } from "@aws-sdk/rds-signer";
import {fromIni} from "@aws-sdk/credential-providers";

interface Config {
	stage: string;
	database: {
		hostname: string;
		user: string;
		port: number;
	}
}

function getEnvOrThrow(key: string): string {
	const value = process.env[key];
	if (value === undefined) {
		throw new Error(`Environment variable ${key} is not set`);
	}
	return value;
}

function getConfig(): Config {
	return {
		stage: process.env['STAGE'] || 'DEV',
		database: {
			hostname: getEnvOrThrow('DATABASE_HOSTNAME'),
			user: getEnvOrThrow('DATABASE_USER'),
			port: 5432,
		}
	}
}

async function getDatasource(config: Config): Promise<Datasources> {
	if (config.stage === 'INFRA') {
		console.log('Obtaining IAM token for RDS connection')
		const {hostname, port, user} = config.database

		const signer = new Signer({
			hostname,
			port,
			username: user,
			// TODO: Use a credential provider chain so this works properly in PROD
			credentials: fromIni({profile: 'deployTools'}),
			region: 'eu-west-1'
		});
		const token = await signer.getAuthToken();

		const url = `user=${user} password=${token} host=${hostname} port=${port} dbname=postgres sslmode=require schema=public`;

		return {
			db: {
				url
			}
		}
	}

	return Promise.resolve({
		db: {
			// TODO: Specify the local DB connection in a single place? At the moment it is also in docker-compose.yml
			url: 'postgresql://postgres:not_at_all_secret@localhost:5432/postgres?schema=public'
		}
	})
}

async function getPrismaClient(config: Config): Promise<PrismaClient> {
	return new PrismaClient({
		datasources: await getDatasource(config)
	});
}

async function main() {
	// ... you will write your Prisma Client queries here
	//   const allUsers = await prisma.user.findMany()
	//   console.log(allUsers)
	const config = getConfig();
	const prisma = await getPrismaClient(config);

	try {
		const repos: GitHubRepositories = await prisma.github_repositories.findMany();
		const evaluation = repository01(repos).sort();
		const branches: GitHubRepositoryBranches =
			await prisma.github_repository_branches.findMany();
		console.table(evaluation);
		console.table(repository02(repos, branches));
	} catch(e) {
		console.error(e);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main()
	.then(async () => {
		process.exit(0);
	})
	.catch(async (e) => {
		console.error(e);
		process.exit(1);
	});
