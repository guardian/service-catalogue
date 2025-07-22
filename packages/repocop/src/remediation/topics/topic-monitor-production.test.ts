import  assert from 'assert';
import { describe, it } from 'node:test';import type { Repository } from 'common/src/types.js';
import { nullRepo } from '../../evaluation/repository.test.js';
import type { AwsCloudFormationStack } from '../../types.js';
import {
	createMessage,
	findReposInProdWithoutProductionTopic,
	getRepoNamesWithoutProductionTopic,
} from './topic-monitor-production.js';

const myRepoProdStack: AwsCloudFormationStack = {
	stack_name: 'hello-my-repo-PROD',
	creation_time: new Date('2021-01-01'),
	tags: {
		Stage: 'PROD',
		'gu:repo': 'guardian/my-repo',
	},
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

void describe('getReposWithoutProductionTopic', () => {
	void it('should return an empty array when unarchivedRepos array is empty', () => {
		const unarchivedRepos: Repository[] = [];
		const result: string[] =
			getRepoNamesWithoutProductionTopic(unarchivedRepos);
		assert.deepStrictEqual(result, []);
	});

	void it('should return only repositories without production or interactive topics and without "interactive" in the repo name', () => {
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
		assert.deepStrictEqual(result, ['guardian/repo-good-1', 'guardian/repo-good-2']);
	});
});

void describe('getReposInProdWithoutProductionTopic', () => {
	void it('should return an empty array when no repos are provided', () => {
		const result = findReposInProdWithoutProductionTopic([], [myRepoProdStack]);
		assert.deepStrictEqual(result, []);
	});
	void it('should return an empty array when no stacks are provided', () => {
		const result = findReposInProdWithoutProductionTopic([myRepo], []);
		assert.deepStrictEqual(result, []);
	});
	void it('should return an empty array there are no stacks with a guRepoName', () => {
		const stack: AwsCloudFormationStack = {
			...myRepoProdStack,
			tags: { Stage: 'PROD' },
		};
		const result = findReposInProdWithoutProductionTopic([myRepo], [stack]);
		assert.deepStrictEqual(result, []);
	});
	void it('should return an empty when a stack is tagged with a different repo', () => {
		const yourStack = {
			...myRepoProdStack,
			tags: { ...myRepoProdStack.tags, 'gu:repo': 'guardian/another-repo' },
		};
		const result = findReposInProdWithoutProductionTopic([myRepo], [yourStack]);
		assert.deepStrictEqual(result, []);
	});

	//The next four tests are examining the behaviour of isProdStack(), which is not exported
	void it('should return a value when a stack has a matching repo name and a PROD Stage tag', () => {
		const result = findReposInProdWithoutProductionTopic(
			[myRepo],
			[myRepoProdStack],
		);
		assert.deepStrictEqual(result, [myRepoProdStack]);
	});
	void it('should return a value when a stack has a matching repo name and an INFRA Stage tag', () => {
		const myRepoInfraStack = {
			...myRepoProdStack,
			tags: { ...myRepoProdStack.tags, Stage: 'INFRA' },
		};
		const result = findReposInProdWithoutProductionTopic(
			[myRepo],
			[myRepoInfraStack],
		);
		assert.deepStrictEqual(result, [myRepoInfraStack]);
	});
	void it('should not return a value if a stack has a matching repo name but a stage of CODE', () => {
		const myRepoCodeStack = {
			...myRepoProdStack,
			tags: { ...myRepoProdStack.tags, Stage: 'CODE' },
		};
		const result = findReposInProdWithoutProductionTopic(
			[myRepo],
			[myRepoCodeStack],
		);
		assert.deepStrictEqual(result, []);
	});
	void it('should not return a value if a stack has a stage of playground', () => {
		const myRepoPlaygroundStack = {
			...myRepoProdStack,
			tags: { ...myRepoProdStack.tags, Stack: 'playground' },
		};
		const result = findReposInProdWithoutProductionTopic(
			[myRepo],
			[myRepoPlaygroundStack],
		);
		assert.deepStrictEqual(result, []);
	});

	//This tests the behaviour of stackIsOlderThan(), which is not exported
	void it('should not return a value if a stack was created less than 3 months ago', () => {
		const myRepoProdStackNew: AwsCloudFormationStack = {
			...myRepoProdStack,
			creation_time: new Date(),
		};
		const result = findReposInProdWithoutProductionTopic(
			[myRepo],
			[myRepoProdStackNew],
		);
		assert.deepStrictEqual(result, []);
	});
});

void describe('createMessage', () => {
	void it('its response', () => {
		const actual = createMessage(
			'guardian/service-catalogue',
			'service-catalogue-PROD',
			'devx-security',
			1,
		);

		assert.deepStrictEqual(actual, {
			message:
				"The 'production' topic has applied to guardian/service-catalogue which has the stack service-catalogue-PROD.\nThis is because stack is over 1 months old and has PROD or INFRA tags.\nRepositories with PROD or INFRA stacks should have a 'production' topic to help with security.\nVisit the links below to learn more about topics and how to add/remove them if you need to.",
			subject: 'Production topic monitoring (for GitHub team devx-security)',
		});
	});
});
