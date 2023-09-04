import { PrismaClient } from "@prisma/client";
import {Signer} from "@aws-sdk/rds-signer";

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


export async function main() {
	const config = getConfig();
	const prisma = new PrismaClient({
		datasources: {
			db: {
				url: await getDatabaseUrl(config),
			},
		}
	});
	console.log('Query prisma');
	const queryResult = await prisma.github_repositories.findFirst({where: {
		archived: false,
	}})

	if (queryResult)
		console.log(queryResult.name || "not found")
}

async function getDatabaseUrl(config: Config){

	const {hostname, port, user} = config.database

	const signer = new Signer({
		hostname,
		port,
		username: user,
		region: 'eu-west-1'
	});
	const token = await signer.getAuthToken();

	const databaseUrl = `postgres://repocop:${encodeURIComponent(token)}@${hostname}:${port}/postgres?schema=public&sslmode=verify-full`;

	return databaseUrl
}


