import type { AWSCloudformationStack } from 'common/types';
import { nullRepo } from '../../rules/repository.test';
import type { Repository } from '../../types';
import {
	findReposInProdWithoutProductionTopic,
	getRepoNamesWithoutProductionTopic,
} from './topic-monitor-production';

const myRepoProdStack: AWSCloudformationStack = {
	stackName: 'hello-my-repo-PROD',
	creationTime: new Date('2021-01-01'),
	tags: {
		Stage: 'PROD',
	},
	guRepoName: 'guardian/my-repo',
};

const myRepo: Repository = {
	full_name: 'guardian/my-repo',
	name: 'my-repo',
	topics: [],
	id: 1n,
	archived: false,
	default_branch: 'main',
	created_at: new Date('2021-01-01'),
	updated_at: new Date('2021-01-01'),
	pushed_at: new Date('2021-01-01'),
};

describe('getReposWithoutProductionTopic', () => {
	it('should return an empty array when unarchivedRepos array is empty', () => {
		const unarchivedRepos: Repository[] = [];
		const result: string[] =
			getRepoNamesWithoutProductionTopic(unarchivedRepos);
		expect(result).toEqual([]);
	});

	it('should return only repositories without production or interactive topics and without "interactive" in the repo name', () => {
		const unarchivedRepos: Repository[] = [
			{
				...nullRepo,
				full_name: 'guardian/repo-bad-1',
				topics: ['production'],
			},
			{
				...nullRepo,
				full_name: 'guardian/repo-good-1',
				topics: ['prototype'],
			},
			{
				...nullRepo,
				full_name: 'guardian/repo-bad-2',
				topics: ['interactive'],
			},
			{
				...nullRepo,
				full_name: 'guardian/repo-bad-interactive-3',
			},
			{
				...nullRepo,
				full_name: 'guardian/repo-good-2',
			},
		];

		const result: string[] =
			getRepoNamesWithoutProductionTopic(unarchivedRepos);
		expect(result).toEqual(['guardian/repo-good-1', 'guardian/repo-good-2']);
	});
});

describe('getReposInProdWithoutProductionTopic', () => {
	it('should return an empty array when reposWithoutProductionTopic array is empty', () => {
		const result: AWSCloudformationStack[] =
			findReposInProdWithoutProductionTopic([], [myRepoProdStack]);
		expect(result).toEqual([]);
	});
	it('should return an empty array when stacks array is empty', () => {
		const result: AWSCloudformationStack[] =
			findReposInProdWithoutProductionTopic([myRepo], []);
		expect(result).toEqual([]);
	});
	it('should return an empty array there are no stacks with a matching guRepoName', () => {
		const stack: AWSCloudformationStack = {
			...myRepoProdStack,
			guRepoName: undefined,
		};
		const result: AWSCloudformationStack[] =
			findReposInProdWithoutProductionTopic([myRepo], [stack]);
		expect(result).toEqual([]);
	});
	it('should return an empty when a stack is tagged with a different repo', () => {
		const yourStack: AWSCloudformationStack = {
			...myRepoProdStack,
			guRepoName: 'guardian/a-different-repo',
		};
		const result: AWSCloudformationStack[] =
			findReposInProdWithoutProductionTopic([myRepo], [yourStack]);
		expect(result).toEqual([]);
	});
	it('should return an empty array when a stack has a matching repo name but no matching stage tags', () => {
		const myRepoCodeStack: AWSCloudformationStack = {
			...myRepoProdStack,
			guRepoName: 'guardian/repo-bad',
			tags: {
				Stage: 'CODE',
			},
		};
		const result: AWSCloudformationStack[] =
			findReposInProdWithoutProductionTopic([myRepo], [myRepoCodeStack]);
		expect(result).toEqual([]);
	});

	//The next four tests are examining the behaviour of isProdStack(), which is not exported
	it('should return a value when a stack has a matching repo name and a PROD Stage tag', () => {
		const result: AWSCloudformationStack[] =
			findReposInProdWithoutProductionTopic([myRepo], [myRepoProdStack]);
		expect(result).toEqual([myRepoProdStack]);
	});
	it('should return a value when a stack has a matching repo name and an INFRA Stage tag', () => {
		const myRepoInfraStack: AWSCloudformationStack = {
			...myRepoProdStack,
			tags: {
				Stage: 'INFRA',
			},
		};
		const result: AWSCloudformationStack[] =
			findReposInProdWithoutProductionTopic([myRepo], [myRepoInfraStack]);
		expect(result).toEqual([myRepoInfraStack]);
	});
	it('should not return a value if a stack has a stage of CODE', () => {
		const myRepoCodeStack: AWSCloudformationStack = {
			...myRepoProdStack,
			tags: {
				Stage: 'CODE',
			},
		};
		const result: AWSCloudformationStack[] =
			findReposInProdWithoutProductionTopic([myRepo], [myRepoCodeStack]);
		expect(result).toEqual([]);
	});
	it('should not return a value if a stack has a stage of playground', () => {
		const myRepoPlaygroundStack: AWSCloudformationStack = {
			...myRepoProdStack,
			tags: {
				Stage: 'playground',
			},
		};
		const result: AWSCloudformationStack[] =
			findReposInProdWithoutProductionTopic([myRepo], [myRepoPlaygroundStack]);
		expect(result).toEqual([]);
	});

	//This tests the behaviour of stackIsOlderThan(), which is not exported
	it('should not return a value if a stack was created less than 3 months ago', () => {
		const myRepoProdStackNew: AWSCloudformationStack = {
			...myRepoProdStack,
			creationTime: new Date(),
		};
		const result: AWSCloudformationStack[] =
			findReposInProdWithoutProductionTopic([myRepo], [myRepoProdStackNew]);
		expect(result).toEqual([]);
	});
});
