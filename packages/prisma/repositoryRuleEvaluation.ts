import { github_repositories, github_repository_branches } from '@prisma/client';
import type { RepoRuleEvaluation } from './model';

export function repository01(repo: github_repositories): boolean {
	return repo.default_branch === 'main';
}

export function repository02(
	repo: github_repositories,
	branches: github_repository_branches[],
): boolean {
	const branch: github_repository_branches | undefined = branches.find((branch) => branch.repository_id === repo.id && branch.name === repo.default_branch)
	if (branch === undefined) {
		return false
	}
	else {return branch!.protected!}
}

export function repositoryRuleEvaluation(
	repo: github_repositories,
	allBranches: github_repository_branches[],
): RepoRuleEvaluation {
	return {
		full_name: repo.full_name!,
		repository_01: repository01(repo),
		repository_02: repository02(repo, allBranches),
	};
}
