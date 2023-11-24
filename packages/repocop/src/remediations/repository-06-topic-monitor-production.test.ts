import type { github_repositories } from '@prisma/client';
import type { AWSCloudformationTag } from 'common/types';
import { nullRepo } from '../rules/repository.test';
import {
	getGuRepoNames,
	getReposWithoutProductionTopic,
	removeGuardian,
} from './repository-06-topic-monitor-production';

describe('getReposWithoutProductionTopic', () => {
	it('should return an empty array when unarchivedRepos array is empty', () => {
		const unarchivedRepos: github_repositories[] = [];
		const result: string[] = getReposWithoutProductionTopic(unarchivedRepos);
		expect(result).toEqual([]);
	});

	it('should return only repositories without production or interactive topics and without "interactive" in the repo name', () => {
		const unarchivedRepos: github_repositories[] = [
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

		const result: string[] = getReposWithoutProductionTopic(unarchivedRepos);
		expect(result).toEqual(['guardian/repo-good-1', 'guardian/repo-good-2']);
	});
});

describe('getGuRepoNames', () => {
	it('should return an empty array when tags array is empty', () => {
		const cfnTags: AWSCloudformationTag[] = [];
		const result: string[] = getGuRepoNames(cfnTags);
		expect(result).toEqual([]);
	});

	it('should return only the "gu:repo" tag value', () => {
		const cfnTags: AWSCloudformationTag[] = [
			{
				App: 'app-1',
				Stack: 'stack1',
				Stage: 'PROD',
				'gu:repo': 'guardian/repo-1',
				'gu:build-tool': 'guardian/some-build-tool',
			},
		];

		const result: string[] = getGuRepoNames(cfnTags);
		expect(result).toEqual(['guardian/repo-1']);
	});
});

describe('removeGuardian', () => {
	it('should strip "guardian/" from the full repo name', () => {
		const fullRepoName = 'guardian/repo-1';
		const result: string = removeGuardian(fullRepoName);
		expect(result).toEqual('repo-1');
	});
});
