import type { Octokit } from 'octokit';
import { generateBranchName, getExistingPullRequest } from './pull-requests';

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
			ref: 'integrate-snyk-abcd',
		},
		user: {
			login: 'gu-snyk-integrator[bot]',
			type: 'Bot',
		},
	};

	const snykBranch2 = {
		...snykBranch,
		head: {
			ref: 'integrate-snyk-efgh',
		},
	};

	it('should return undefined when no matching branch found', async () => {
		const pulls = [featureBranch];
		const foundPull = await getExistingPullRequest(
			mockOctokit(pulls),
			'repo',
			'gu-snyk-integrator[bot]',
		);
		expect(foundPull).toBeUndefined();
	});

	it('should return pull request when author matches', async () => {
		const pulls = [featureBranch, snykBranch];
		const foundPull = await getExistingPullRequest(
			mockOctokit(pulls),
			'repo',
			'gu-snyk-integrator[bot]',
		);
		expect(foundPull).toEqual(snykBranch);
	});

	it('should return first pull request that matches and log warning', async () => {
		const warn = jest.spyOn(console, 'warn');
		const pulls = [featureBranch, snykBranch, snykBranch2];
		const foundPull = await getExistingPullRequest(
			mockOctokit(pulls),
			'repo',
			'gu-snyk-integrator[bot]',
		);
		expect(foundPull).toEqual(snykBranch);
		expect(warn).toHaveBeenCalledWith(
			'More than one PR found on repo - choosing the first.',
		);
		warn.mockRestore();
	});
});

describe('generateBranchName', () => {
	it('does not produce the same branch name twice', () => {
		const prefix = 'hello';
		const branch1 = generateBranchName(prefix);
		const branch2 = generateBranchName(prefix);
		expect(branch1).not.toEqual(branch2);
	});
});
