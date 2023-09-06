import { PrismaClient } from "@prisma/client";
import { getConfig } from "./config";

export async function main() {
	const config = await getConfig();
	const prisma = new PrismaClient({
		datasources: {
			db: {
				url: config.databaseConnectionString,
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
