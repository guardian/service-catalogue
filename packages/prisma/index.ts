import { PrismaClient } from '@prisma/client';
import { repository01, repository02 } from './repositoryRuleEvaluation';
import {Datasources} from "@prisma/client/runtime/library";
import * as process from "process";
import { Signer } from "@aws-sdk/rds-signer";

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
			user: 'repocop',
			port: 5432,
		}
	}
}

async function getDatasource(config: Config): Promise<Datasources> {
	if (config.stage === 'INFRA') {

		const {hostname, port, user} = config.database

		const signer = new Signer({
			hostname,
			port,
			username: user,
			region: 'eu-west-1'
		});
		const token = await signer.getAuthToken();

		const url = `postgresql://${user}:${encodeURIComponent(token)}@${hostname}:${port}/postgres?schema=public&sslmode=verify-full`;

		return {
			db: {
				url
			}
		}
	}
	else {
		return {
			db: {
				url: getEnvOrThrow('DATABASE_URL')
			}
		}
	}
}

async function getPrismaClient(config: Config): Promise<PrismaClient> {
	return new PrismaClient({
		datasources: await getDatasource(config)
	});
}

export async function main() {
	const config = getConfig();
	const prisma = await getPrismaClient(config);

	try {
		const repo = await prisma.github_repositories.findFirst();
		const branches = await prisma.github_repository_branches.findMany();
		console.log(repository01(repo))
		console.log(repository02(repo, branches));
	} catch(e) {
		console.error(e);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// main()
// 	.then(async () => {
// 		process.exit(0);
// 	})
// 	.catch(async (e) => {
// 		console.error(e);
// 		process.exit(1);
// 	});
