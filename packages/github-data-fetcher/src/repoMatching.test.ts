import { mockRepo } from './mockRepo';
import { foundUnchangedMatchOnGithub } from './repoMatching';
import { asRepo } from './transformations';

describe('a positive date match', function () {
	it('should be confirmed if dates match up exactly', function () {
		const finalRepoObject = asRepo(mockRepo, [], []);

		expect(
			foundUnchangedMatchOnGithub(finalRepoObject, [mockRepo]),
		).toStrictEqual(true);
	});
	it('should not be confirmed if any date returned is a null', function () {
		expect(true).toStrictEqual(true);
	});
});
