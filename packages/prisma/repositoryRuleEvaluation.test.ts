import { github_repositories, github_repository_branches } from '@prisma/client';
import { repository01, repository02 } from './repositoryRuleEvaluation';

const nullRepo: github_repositories = 

const thePerfectRepo: github_repositories = {
	full_name: 'repo1',
	default_branch: 'main',
	topics: ['production'],
	id: BigInt(1),
};


describe('repository_01 should be false when the default branch is not main', () => {
	test('branch is not main', () => {
		const repos = [
			thePerfectRepo,
			{ ...thePerfectRepo, default_branch: 'notMain' },
		];
		const result = repository01(repos).map((repo) => repo.repository_01);
		expect(result).toEqual([true, false]);
	});

	describe('Repositories should have branch protection', () => {
		test('We should get an affirmative result when the default branch is protected', () => {
			const protectedMainBranch: github_repository_branches[]= {
				repository_id: BigInt(1),
				name: 'main',
				protected: true,
				protection: {},
			};
			const unprotectedSideBranch: github_repository_branches[] = {
				...protectedMainBranch,
				protected: false,
			};

			const result = repository02(
				[thePerfectRepo],
				[protectedMainBranch, unprotectedSideBranch],
			).map((repo) => repo.repository_02);
			expect(result).toEqual([true]);
		});
		test('We should get a negative result when the default branch is not protected', () => {
			const repo = {
				full_name: 'repo1',
				default_branch: 'default',
				topics: null,
				id: BigInt(1),
			};

			const unprotectedMainBranch: github_repository_branches = {
				repository_id: BigInt(1),
				name: 'default',
				protected: false,
				protection: {},
			};

			const result = repository02([repo], [unprotectedMainBranch]).map(
				(repo) => repo.repository_02,
			);
			expect(result).toEqual([false]);
		});
	});
});
