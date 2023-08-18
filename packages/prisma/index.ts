import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GitHubRepository {
	full_name: string | null;
	default_branch: string | null;
	topics: string[] | null;
	id: bigint | null;
}

type GitHubRepositories = GitHubRepository[];

interface GitHubRepositoryBranch {
	repository_id: bigint;
	name: string;
	protected: boolean | null;
	protection: any;
}

type GitHubRepositoryBranches = GitHubRepositoryBranch[];

interface Repository01 {
	full_name: string;
	repository_01: boolean;
}

export function repository01(repos: GitHubRepositories): Repository01[] {
	return repos.map((repo) => {
		return {
			full_name: repo.full_name ?? '',
			repository_01: repo.default_branch == 'main',
		};
	});
}

interface Repository02 {
	full_name: string | null;
	repository_02: boolean | null;
}

function findBranchProtectionForOneRepo(
	repo: GitHubRepository,
	branches: GitHubRepositoryBranches,
): Repository02 {
	const branch = branches.find((branch) => {
		return (
			branch.repository_id == repo.id && branch.name == repo.default_branch
		);
	});
	return {
		full_name: repo.full_name ?? '',
		repository_02: branch?.protected ?? false,
	};
}

function repository02(
	repos: GitHubRepositories,
	branches: GitHubRepositoryBranches,
): Repository02[] {
	return repos.map((repo) => {
		return findBranchProtectionForOneRepo(repo, branches);
	});
}

async function main() {
	// ... you will write your Prisma Client queries here
	//   const allUsers = await prisma.user.findMany()
	//   console.log(allUsers)
	const repos: GitHubRepositories = await prisma.github_repositories.findMany();
	const evaluation = repository01(repos).sort();
	const branches: GitHubRepositoryBranches =
		await prisma.github_repository_branches.findMany();
	console.log(evaluation[0]);
	console.log(repository02(repos, branches)[0]);
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
