import { github_repositories, github_repository_branches } from '@prisma/client';
import { repository01, repository02 } from './repositoryRuleEvaluation';
import nullRepo from './resources/nullrepo.json';
import nullBranch from './resources/nullGithubRepositoryBranches.json';

const thePerfectRepo: github_repositories = {
	...nullRepo,
	full_name: 'repo1',
	default_branch: 'main',
	topics: ['production'],
	id: BigInt(1),
};

describe('repository_01 should be false when the default branch is not main', () => {
	test('branch is not main', () => {
		const repos: github_repositories[] = [
			thePerfectRepo,
			{ ...thePerfectRepo, default_branch: 'notMain' },
		];
		expect(repos.map(repository01)).toEqual([true, false]);
	});

	describe('Repositories should have branch protection', () => {
		test('We should get an affirmative result when the default branch is protected', () => {
			const protectedMainBranch: github_repository_branches= {
				...nullBranch,
				repository_id: BigInt(1),
				name: 'main',
				protected: true,
			};
			const unprotectedSideBranch: github_repository_branches = {
				...protectedMainBranch,
				protected: false,
			};

			const result = repository02(
				thePerfectRepo,
				[protectedMainBranch, unprotectedSideBranch],
			);
			expect(result).toEqual(true);
		});
		test('We should get a negative result when the default branch is not protected', () => {
			const repo: github_repositories = {
				...nullRepo,
				full_name: 'repo1',
				default_branch: 'default',
				id: BigInt(1),
			};

			const unprotectedMainBranch: github_repository_branches = {
				...nullBranch,
				repository_id: BigInt(1),
				name: 'default',
				protected: false,
				protection: {},
			};
			expect( repository02(repo, [unprotectedMainBranch])).toEqual(false);
		});
	});
});
