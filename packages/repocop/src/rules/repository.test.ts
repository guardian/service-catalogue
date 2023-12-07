import type { github_repository_branches } from '@prisma/client';
import type { AWSCloudformationStack } from 'common/types';
import type { RepositoryTeam } from '../query';
import type { Repository } from '../types';
import { evaluateOneRepo, findStacks } from './repository';

const nullBranch: github_repository_branches = {
	cq_sync_time: null,
	cq_source_name: null,
	cq_id: '',
	cq_parent_id: null,
	org: 'guardian',
	repository_id: BigInt(0),
	protection: null,
	name: '',
	commit: null,
	protected: null,
};

export const nullRepo: Repository = {
	full_name: '',
	name: '',
	archived: false,
	id: BigInt(0),
	created_at: new Date(),
	updated_at: null,
	pushed_at: null,
	topics: [],
	default_branch: null,
};

const thePerfectRepo: Repository = {
	...nullRepo,
	full_name: 'repo1',
	name: 'repo1',
	archived: false,
	id: BigInt(1),
	topics: ['production'],
	default_branch: 'main',
};

describe('default_branch_name should be false when the default branch is not main', () => {
	test('branch is not main', () => {
		const badRepo = { ...thePerfectRepo, default_branch: 'notMain' };
		const repos: Repository[] = [thePerfectRepo, badRepo];
		const evaluation = repos.map((repo) => evaluateOneRepo(repo, [], []));

		expect(evaluation.map((repo) => repo.default_branch_name)).toEqual([
			true,
			false,
		]);
	});
});

describe('Repositories should have branch protection', () => {
	const unprotectedMainBranch: github_repository_branches = {
		...nullBranch,
		repository_id: BigInt(1),
		name: 'main',
		protected: false,
		protection: {},
	};
	const protectedMainBranch: github_repository_branches = {
		...unprotectedMainBranch,
		protected: true,
	};

	test('We should get an affirmative result when the default branch is protected', () => {
		const unprotectedSideBranch: github_repository_branches = {
			...unprotectedMainBranch,
			name: 'side-branch',
		};

		const actual = evaluateOneRepo(
			thePerfectRepo,
			[protectedMainBranch, unprotectedSideBranch],
			[],
		);

		expect(actual.branch_protection).toEqual(true);
	});
	test('We should get a negative result when the default branch of a production repo is not protected', () => {
		const actual = evaluateOneRepo(thePerfectRepo, [unprotectedMainBranch], []);
		expect(actual.branch_protection).toEqual(false);
	});
	test('Repos with no branches do not need protecting, and should be considered protected', () => {
		const repo: Repository = {
			...thePerfectRepo,
			default_branch: null,
		};

		const actual = evaluateOneRepo(repo, [], []);
		expect(actual.branch_protection).toEqual(true);
	});
	test('Repos with exempted topics should be considered adequately protected, even if they have an unprotected main branch', () => {
		const repo: Repository = {
			...thePerfectRepo,
			topics: ['hackday'],
		};

		const actual = evaluateOneRepo(repo, [unprotectedMainBranch], []);
		expect(actual.branch_protection).toEqual(true);
	});
});

describe('Repository admin access', () => {
	test('Should return false when there is no admin team', () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
		};

		const teams: RepositoryTeam[] = [
			{
				role_name: 'read-only',
				id: 1234n,
			},
		];

		const actual = evaluateOneRepo(repo, [], teams);
		expect(actual.admin_access).toEqual(false);
	});

	test('Should return true when there is an admin team', () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
		};

		const teams: RepositoryTeam[] = [
			{
				role_name: 'read-only',
				id: 1234n,
			},
			{
				role_name: 'admin',
				id: 1234n,
			},
		];

		const actual = evaluateOneRepo(repo, [], teams);
		expect(actual.admin_access).toEqual(true);
	});

	test(`Should validate repositories with a 'hackday' topic`, () => {
		//We are not interested in making sure hackday projects are kept up to date
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['hackday'],
		};

		const actual = evaluateOneRepo(repo, [], []);
		expect(actual.admin_access).toEqual(true);
	});

	test(`Should evaluate repositories with a 'production' topic`, () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['production'],
		};

		const teams: RepositoryTeam[] = [
			{
				role_name: 'read-only',
				id: 1234n,
			},
			{
				role_name: 'admin',
				id: 1234n,
			},
		];
		const actual = evaluateOneRepo(repo, [], teams);
		expect(actual.admin_access).toEqual(true);
	});

	test(`Should return false if all topics are unrecognised`, () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['avocado'],
		};

		const actual = evaluateOneRepo(repo, [], []);
		expect(actual.admin_access).toEqual(false);
	});
});

describe('Repository topics', () => {
	test('Should return true when there is a single recognised topic', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production'],
		};

		const actual = evaluateOneRepo(repo, [], []);
		expect(actual.topics).toEqual(true);
	});

	test(`Should validate repos with an interactive topic`, () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/service-catalogue',
			id: 1234n,
			topics: ['interactive'],
		};

		const actual = evaluateOneRepo(repo, [], []);
		expect(actual.topics).toEqual(true);
	});

	test('Should return false when there are multiple recognised topics', () => {
		// Having more than one recognised topic creates confusion about how the repo
		// is being used, and could also confuse repocop.
		const repo: Repository = {
			...nullRepo,
			topics: ['production', 'hackday'],
		};

		const actual = evaluateOneRepo(repo, [], []);
		expect(actual.topics).toEqual(false);
	});

	test('Should return true when there is are multiple topics, not all are recognised', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['production', 'android'],
		};

		const actual = evaluateOneRepo(repo, [], []);
		expect(actual.topics).toEqual(true);
	});

	test('Should return false when there are no topics', () => {
		const repo: Repository = {
			...nullRepo,
			topics: [],
		};

		const actual = evaluateOneRepo(repo, [], []);
		expect(actual.topics).toEqual(false);
	});

	test('Should return false when there are no recognised topics', () => {
		const repo: Repository = {
			...nullRepo,
			topics: ['android', 'mobile'],
		};

		const actual = evaluateOneRepo(repo, [], []);
		expect(actual.topics).toEqual(false);
	});
});

describe('Repository maintenance', () => {
	test('should have happened at some point in the last two years', () => {
		const recentRepo: Repository = {
			...nullRepo,
			created_at: new Date(),
		};

		const oldRepo: Repository = {
			...nullRepo,
			created_at: new Date('2019-01-01'),
		};

		const recentEval = evaluateOneRepo(recentRepo, [], []);
		const oldEval = evaluateOneRepo(oldRepo, [], []);
		expect(recentEval.archiving).toEqual(true);
		expect(oldEval.archiving).toEqual(false);
	});
	test('should be based only on the most recent date provided', () => {
		const recentlyUpdatedRepo: Repository = {
			...nullRepo,
			updated_at: new Date(),
			//these two dates are more than two years in the past, but should be
			//ignored because the updated_at date is more recent
			created_at: new Date('2019-01-01'),
			pushed_at: new Date('2020-01-01'),
		};

		const actual = evaluateOneRepo(recentlyUpdatedRepo, [], []);
		expect(actual.archiving).toEqual(true);
	});
	test('is not a concern if no dates are found', () => {
		const recentlyUpdatedRepo: Repository = {
			...nullRepo,
		};

		const actual = evaluateOneRepo(recentlyUpdatedRepo, [], []);
		expect(actual.archiving).toEqual(true);
	});
});

describe('Repositories with related stacks on AWS', () => {
	test('should be findable if a stack has a matching tag', () => {
		const full_name = 'guardian/repo1';
		const tags = {
			'gu:repo': full_name,
		};
		const repo: Repository = {
			...nullRepo,
			full_name,
			name: 'repo1',
			archived: false,
		};
		const stack: AWSCloudformationStack = {
			stackName: 'mystack',
			guRepoName: full_name,
			creationTime: new Date(),
			tags,
		};
		console.log(findStacks(repo, [stack]));
		const result = findStacks(repo, [stack]).stacks.length;
		expect(result).toEqual(1);
	});
	test('should be findable if the repo name is part of the stack name', () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/repo1',
			name: 'repo1',
			archived: false,
		};

		const stack: AWSCloudformationStack = {
			stackName: 'mystack-repo1-PROD',
			tags: {},
			creationTime: new Date(),
		};
		const result = findStacks(repo, [stack]).stacks.length;
		expect(result).toEqual(1);
	});
});

describe('Repositories without any related stacks on AWS', () => {
	test('should not be findable', () => {
		const repo: Repository = {
			...nullRepo,
			full_name: 'guardian/someRepo',
			name: 'someRepo',
			archived: false,
		};

		const tags = {
			App: 'myApp',
			Stack: 'myStack',
			Stage: 'CODE',
			'gu:repo': 'guardian/someOtherRepo',
			'gu:build-tool': 'unknown',
		};

		const stack1: AWSCloudformationStack = {
			stackName: 'stack1',
			tags,
			guRepoName: 'guardian/someOtherRepo',
			creationTime: new Date(),
		};
		const stack2: AWSCloudformationStack = {
			stackName: 'stack2',
			tags: {
				...tags,
				Stage: 'PROD',
			},
			guRepoName: 'guardian/someOtherRepo',
			creationTime: new Date(),
		};
		const result = findStacks(repo, [stack1, stack2]).stacks.length;
		expect(result).toEqual(0);
	});
});
