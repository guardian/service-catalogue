import type { Octokit } from 'octokit';
import { getPullRequest } from './pull-requests';

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

	it('should return undefined when no matching branch found', async () => {
		const pulls = [featureBranch];
		const foundPull = await getPullRequest(
			mockOctokit(pulls),
			'repo',
			'integrate-snyk-branch',
		);
		expect(foundPull).toBeUndefined();
	});

	it("should return undefined when branch found but author doesn't match", async () => {
		const pulls = [
			featureBranch,
			{
				head: {
					ref: 'integrate-snyk-branch',
				},
				user: {
					login: 'some-user',
					type: 'User',
				},
			},
		];
		const foundPull = await getPullRequest(
			mockOctokit(pulls),
			'repo',
			'integrate-snyk-branch',
		);
		expect(foundPull).toBeUndefined();
	});

	it('should return pull request when branch found and author matches', async () => {
		const snykBranch = {
			head: {
				ref: 'integrate-snyk-branch',
			},
			user: {
				login: 'gu-snyk-integrator[bot]',
				type: 'Bot',
			},
		};
		const pulls = [featureBranch, snykBranch];
		const foundPull = await getPullRequest(
			mockOctokit(pulls),
			'repo',
			'integrate-snyk-branch',
		);
		expect(foundPull).toEqual(snykBranch);
	});
});
