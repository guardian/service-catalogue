import type { Octokit } from 'octokit';
import { getExistingPullRequest } from './pull-requests';

/**
 * Create a mocked version of the Octokit SDK that returns a given array of pull requests
 */
function mockOctokit(pulls: unknown[]) {
	return {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars -- It's just a mock
		paginate: (arg0: unknown, arg1: unknown) => Promise.resolve(pulls),
		rest: {
			pulls: {
				list: () => {},
			},
		},
	} as Octokit;
}

describe('getPullRequest', () => {
	const featureBranch = {
		head: {
			ref: 'feature-branch',
		},
		user: {
			login: 'some-user',
			type: 'User',
		},
	};

	const snykBranch = {
		head: {
			ref: 'integrate-snyk-branch',
		},
		user: {
			login: 'gu-snyk-integrator[bot]',
			type: 'Bot',
		},
	};

	it('should return undefined when no matching branch found', async () => {
		const pulls = [featureBranch];
		const foundPull = await getExistingPullRequest(mockOctokit(pulls), 'repo');
		expect(foundPull).toBeUndefined();
	});

	it('should return pull request when author matches', async () => {
		const pulls = [featureBranch, snykBranch];
		const foundPull = await getExistingPullRequest(mockOctokit(pulls), 'repo');
		expect(foundPull).toEqual(snykBranch);
	});

	it('should return first pull request that matches and log warning', async () => {
		const warn = jest.spyOn(console, 'warn');
		const pulls = [featureBranch, snykBranch, snykBranch];
		const foundPull = await getExistingPullRequest(mockOctokit(pulls), 'repo');
		expect(foundPull).toEqual(snykBranch);
		expect(warn).toHaveBeenCalledWith(
			'More than one Snyk integrator PR found on repository - choosing the first.',
		);
		warn.mockRestore();
	});
});
