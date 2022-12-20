import type { RepositoryResponse } from 'common/github/github';
import { mockRepo } from './mockRepo';
import { isCachedRepositoryStale } from './repoMatching';
import { asRepo } from './transformations';

describe('a positive date match', function () {
	it('should be confirmed if dates match up exactly', function () {
		const finalRepoObject = asRepo(mockRepo, [], []);
		const actual = isCachedRepositoryStale(finalRepoObject, [mockRepo]);
		const expected = true;
		expect(actual).toStrictEqual(expected);
	});
	it('should not be confirmed if there are matching nulls', function () {
		const GHRepo: RepositoryResponse = mockRepo;
		GHRepo.updated_at = null;
		const s3Repo = asRepo(GHRepo, [], []);
		const actual = isCachedRepositoryStale(s3Repo, [GHRepo]);
		const expected = false;
		expect(actual).toStrictEqual(expected);
	});
	it('should not be confirmed if some dates are different', function () {
		const GHRepo: RepositoryResponse = mockRepo;
		GHRepo.updated_at = '2020-01-01';
		const s3Repo = asRepo(GHRepo, [], []);
		s3Repo.updated_at = new Date('1989-10-10');

		const actual = isCachedRepositoryStale(s3Repo, [GHRepo]);
		const expected = false;
		expect(actual).toStrictEqual(expected);
	});
});
