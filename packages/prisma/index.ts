import { PrismaClient } from '@prisma/client';
import type { GitHubRepositories, GitHubRepositoryBranches } from './model';
import { repository01, repository02 } from './repositoryRuleEvaluation';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment -- Prisma types these as `any`, which we don't control.
const prisma = new PrismaClient();

async function main() {
	// ... you will write your Prisma Client queries here
	//   const allUsers = await prisma.user.findMany()
	//   console.log(allUsers)
	const repos: GitHubRepositories = await prisma.github_repositories.findMany();
	const evaluation = repository01(repos).sort();
	const branches: GitHubRepositoryBranches =
		await prisma.github_repository_branches.findMany();
	console.table(evaluation);
	console.table(repository02(repos, branches));
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
