import type { AWSCloudformationStack } from 'common/types';
import { nullRepo } from '../../rules/repository.test';
import type { Repository } from '../../types';
import {
	getRepoNamesWithoutProductionTopic,
	isProdStack,
} from './topic-monitor-production';

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

describe('isProdStack', () => {
	const prodStack: AWSCloudformationStack = {
		stackName: 'stack-name',
		creationTime: new Date('2021-01-01'),
		tags: {
			Stage: 'PROD',
		},
		guRepoName: 'guardian/repo',
	};
	it('should return true when stack has Stage tag of PROD or INFRA and a guRepoName', () => {
		expect(isProdStack(prodStack)).toBe(true);
	});
	it('should return false when stack has Stage tag of PROD or INFRA but no guRepoName', () => {
		const stack: AWSCloudformationStack = {
			...prodStack,
			guRepoName: undefined,
		};
		expect(isProdStack(stack)).toBe(false);
	});
	it('should return false when stack has no Stage tag', () => {
		const stack: AWSCloudformationStack = {
			...prodStack,
			tags: {},
		};
		expect(isProdStack(stack)).toBe(false);
	});
	it('should return false when stack has Stage tag of CODE', () => {
		const stack: AWSCloudformationStack = {
			...prodStack,
			tags: {
				Stage: 'CODE',
			},
		};
		expect(isProdStack(stack)).toBe(true);
	});
});
