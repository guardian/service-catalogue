import type { RepositoryResponse } from 'common/github/github';
import type { Commit, Repository } from 'common/model/github';
import { mockRepo } from './mockRepo';
import type { RepoAndOwner } from './transformations';
import { asRepo, findOwnersOfRepo } from './transformations';

const emptyCommit: Commit = {
	message: '',
};

describe('repository owners', function () {
	it('should not be returned if none exist for that repo', function () {
		expect(findOwnersOfRepo('someRepo', [])).toStrictEqual([]);
	});
	it('should be returned only if they exist for that specific repo', function () {
		const owner1: RepoAndOwner = { teamSlug: 'team1', repoName: 'someRepo' };
		const owner2: RepoAndOwner = { teamSlug: 'team2', repoName: 'someRepo' };
		const owner3: RepoAndOwner = {
			teamSlug: 'team3',
			repoName: 'aDifferentRepo',
		};

		const ownerArray = findOwnersOfRepo('someRepo', [owner1, owner2, owner3]);

		expect(ownerArray).toStrictEqual(['team1', 'team2']);
	});
});

describe('repository objects', function () {
	it('should combine a RepositoryResponse with a list of owners', function () {
		const owners = ['team3', 'team4'];
		const languages = ['Scala', 'Go'];
		const repo: RepositoryResponse = mockRepo;
		const finalRepoObject: Repository = asRepo(repo, owners, languages);

		expect(finalRepoObject.owners).toStrictEqual(['team3', 'team4']);
		expect(finalRepoObject.name).toStrictEqual('repo-name');
	});
	it('should combine a RepositoryResponse with the most recent commit', function () {
		const commit = { ...emptyCommit, message: 'hello' };
		const repo: RepositoryResponse = mockRepo;
		const finalRepoObject: Repository = asRepo(repo, [], [], commit);

		expect(finalRepoObject.last_commit?.message).toStrictEqual('hello');
		expect(finalRepoObject.name).toStrictEqual('repo-name');
	});
});

describe('date strings', function () {
	const repo = { ...mockRepo, updated_at: '2015-01-25T08:09:10Z' };
	it('should convert to date objects if they exist', function () {
		const actualDate = asRepo(repo, [], [], emptyCommit).updated_at;
		const expectedDate = new Date(2015, 0, 25, 8, 9, 10);
		expect(actualDate).toEqual(expectedDate);
	});
	it('should return a null if there is no date', function () {
		const actualDate = asRepo(
			{ ...mockRepo, updated_at: '' },
			[],
			[],
			emptyCommit,
		).updated_at;
		expect(actualDate).toEqual(null);
		const actualDate2 = asRepo(
			{ ...mockRepo, updated_at: undefined },
			[],
			[],
			emptyCommit,
		).updated_at;
		expect(actualDate2).toEqual(null);
	});
});
