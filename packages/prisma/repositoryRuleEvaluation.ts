import type {
	GitHubRepositories,
	GitHubRepository,
	GitHubRepositoryBranches,
	RepoRuleEvaluation,
	Repository01,
	Repository02,
} from './model';

export function repository01(repos: GitHubRepositories): Repository01[] {
	return repos.map((repo) => {
		return {
			full_name: repo.full_name ?? '',
			repository_01: repo.default_branch === 'main',
		};
	});
}

function findBranchProtectionForOneRepo(
	repo: GitHubRepository,
	branches: GitHubRepositoryBranches,
): Repository02 {
	const branch = branches.find((branch) => {
		return (
			branch.repository_id === repo.id && branch.name === repo.default_branch
		);
	});
	return {
		full_name: repo.full_name ?? '',
		repository_02: branch?.protected ?? false,
	};
}

export function repository02(
	repos: GitHubRepositories,
	branches: GitHubRepositoryBranches,
): Repository02[] {
	return repos.map((repo) => {
		return findBranchProtectionForOneRepo(repo, branches);
	});
}

export function repositoryRuleEvaluation(
	repo1: Repository01,
	repo2: Repository02,
): RepoRuleEvaluation {
	return {
		full_name: repo1.full_name,
		repository_01: repo1.repository_01,
		repository_02: repo2.repository_02,
	};
}
