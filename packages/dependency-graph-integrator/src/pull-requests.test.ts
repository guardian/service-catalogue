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

	const dependabotBranch = {
		head: {
			ref: 'integrate-dependabot-abcd',
		},
		user: {
			login: 'gu-dependency-graph-integrator[bot]',
			type: 'Bot',
		},
	};

	const dependabotBranch2 = {
		...dependabotBranch,
		head: {
			ref: 'integrate-dependabot-efgh',
		},
	};

	it('should return undefined when no matching branch found', async () => {
		const pulls = [featureBranch];
		const foundPull = await getExistingPullRequest(
			mockOctokit(pulls),
			'repo',
			'owner',
			'gu-dependency-graph-integrator[bot]',
		);
		expect(foundPull).toBeUndefined();
	});

	it('should return pull request when author matches', async () => {
		const pulls = [featureBranch, dependabotBranch];
		const foundPull = await getExistingPullRequest(
			mockOctokit(pulls),
			'repo',
			'owner',
			'gu-dependency-graph-integrator[bot]',
		);
		expect(foundPull).toEqual(dependabotBranch);
	});

	it('should return first pull request that matches and log warning', async () => {
		const warn = jest.spyOn(console, 'warn');
		const pulls = [featureBranch, dependabotBranch, dependabotBranch2];
		const foundPull = await getExistingPullRequest(
			mockOctokit(pulls),
			'repo',
			'owner',
			'gu-dependency-graph-integrator[bot]',
		);
		expect(foundPull).toEqual(dependabotBranch);
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
