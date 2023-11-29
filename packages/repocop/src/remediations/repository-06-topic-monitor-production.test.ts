import type { github_repositories } from '@prisma/client';
import type { AWSCloudformationTag } from 'common/types';
import { nullRepo } from '../rules/repository.test';
import {
	getGuRepoName,
	getRepoNamesWithoutProductionTopic,
	removeGuardian,
} from './repository-06-topic-monitor-production';

describe('getReposWithoutProductionTopic', () => {
	it('should return an empty array when unarchivedRepos array is empty', () => {
		const unarchivedRepos: github_repositories[] = [];
		const result: string[] =
			getRepoNamesWithoutProductionTopic(unarchivedRepos);
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

		const result: string[] =
			getRepoNamesWithoutProductionTopic(unarchivedRepos);
		expect(result).toEqual(['guardian/repo-good-1', 'guardian/repo-good-2']);
	});
});

describe('getGuRepoName', () => {
	it('should return undefined if the "gu:repo" tag value is not present', () => {
		const cfnTag: AWSCloudformationTag = {
			App: 'app-1',
			Stack: 'stack1',
			Stage: 'PROD',
			'gu:build-tool': 'guardian/some-build-tool',
		};
		const result: string | undefined = getGuRepoName(cfnTag);
		expect(result).toEqual(undefined);
	});

	it('should return only the "gu:repo" tag value', () => {
		const cfnTag: AWSCloudformationTag = {
			App: 'app-1',
			Stack: 'stack1',
			Stage: 'PROD',
			'gu:repo': 'guardian/repo-1',
			'gu:build-tool': 'guardian/some-build-tool',
		};
		const result: string | undefined = getGuRepoName(cfnTag);
		expect(result).toEqual('guardian/repo-1');
	});
});

describe('removeGuardian', () => {
	it('should strip "guardian/" from the full repo name', () => {
		const fullRepoName = 'guardian/repo-1';
		const result: string = removeGuardian(fullRepoName);
		expect(result).toEqual('repo-1');
	});
});
