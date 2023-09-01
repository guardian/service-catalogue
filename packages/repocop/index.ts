import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function main() {
	console.log('Query prisma');
	const queryResult = await prisma.github_repositories.findFirst({where: {
		archived: false,
	}})

	if (queryResult)
		console.log(queryResult.name || "not found")
}


