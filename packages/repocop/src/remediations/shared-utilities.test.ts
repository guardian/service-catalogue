import { removeRepoOwner } from './shared-utilities';

describe('removeRepoOwner', () => {
	it('should strip the owner from the full repo name', () => {
		const fullRepoName = 'guardian/repo-1';
		const result: string = removeRepoOwner(fullRepoName);
		expect(result).toEqual('repo-1');
	});
});
