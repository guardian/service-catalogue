import type { RepositoryResponse } from 'common/github/github';
import { mockRepo } from './mockRepo';
import type { RepoAndOwner, Repository } from './transformations';
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
		const repo: RepositoryResponse = mockRepo;
		const finalRepoObject: Repository = asRepo(repo, owners);

		expect(finalRepoObject.owners).toStrictEqual(['team3', 'team4']);
		expect(finalRepoObject.name).toStrictEqual('repo-name');
	});
});
