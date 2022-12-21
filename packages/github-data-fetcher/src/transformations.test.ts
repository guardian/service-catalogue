import type { RepositoryResponse } from 'common/github/github';
import type { Repository } from 'common/model/github';
import { mockRepo } from './mockRepo';
import type { RepoAndOwner } from './transformations';
import { asRepo, findOwnersOfRepo } from './transformations';

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
	it('should pass through the correct RepositoryResponse fields', function () {
		const repoResponse: RepositoryResponse = mockRepo;
		const actual = asRepo(repoResponse, [], []);
		expect(actual.name).toStrictEqual('repo-name');
		expect(actual.pushed_at).toStrictEqual('2011-01-26T19:06:43Z');
		expect(actual.updated_at).toStrictEqual('2011-01-26T19:14:43Z');
		expect(actual.created_at).toStrictEqual('2011-01-26T19:01:12Z');
		expect(actual.size).toStrictEqual(108);
		expect(actual.owners).toStrictEqual([]);
		expect(actual.archived).toStrictEqual(false);
		expect(actual.languages).toStrictEqual([]);
		expect(actual.topics).toStrictEqual(['production']);
		expect(actual.default_branch).toStrictEqual('master');
		expect(actual.lastCommit).toBeUndefined();
		expect(actual.private).toStrictEqual(false);
	});
});
