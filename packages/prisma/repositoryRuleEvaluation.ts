import { github_repositories, github_repository_branches } from '@prisma/client';
import type {
	RepoRuleEvaluation,
	Repository01,
	Repository02,
} from './model';

export function repository01(repo: github_repositories): boolean {
	return repo.default_branch === 'main';
}

export function repository02(
	repo: github_repositories,
	branches: github_repository_branches[],
): boolean {
	const branch = branches.find((branch) => branch.repository_id === repo.id && branch.name === repo.default_branch);
	return branch.protected;
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
