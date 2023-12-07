import { nullRepo } from '../../rules/repository.test';
import type { Repository } from '../../types';
import { getRepoNamesWithoutProductionTopic } from './topic-monitor-production';

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
