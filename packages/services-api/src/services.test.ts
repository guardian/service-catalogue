import type { Repository, Stack } from './services';
import { groupStacksByStage, ownersForStack } from './services';

describe('services', () => {
	it('should group stacks by stage', () => {
		const a: Stack = {
			stackName: 'deploy-CODE-foo',
			metadata: {},
			accountId: 'account123',
			accountName: 'deploy',
			createdTime: new Date(),
			lastUpdatedTime: new Date(),
			tags: {
				App: 'foo',
				Stack: 'deploy',
				Stage: 'CODE',
			},
			devxFeatures: {},
		};

		const b = clone(a);
		b.tags['Stage'] = 'PROD';

		const c = clone(a);
		c.accountId = 'account234';

		const got = groupStacksByStage([a, b, c]);
		const want = [[a, b], [c]];

		expect(got).toEqual(want);
	});

	it('should find owners for a stack', () => {
		const stackA: Stack = {
			stackName: 'deploy-CODE-foo',
			metadata: {},
			accountId: 'account123',
			accountName: 'deploy',
			createdTime: new Date(),
			lastUpdatedTime: new Date(),
			tags: {
				App: 'foo',
				Stack: 'deploy',
				Stage: 'CODE',
				'gu:repo': 'guardian/foo',
			},
			devxFeatures: {},
		};

		const repoA: Repository = {
			id: 123,
			name: 'foo',
			full_name: 'guardian/foo',
			private: true,
			description: null,
			created_at: new Date(),
			updated_at: new Date(),
			pushed_at: null,
			size: 305,
			language: 'Go',
			archived: false,
			open_issues_count: 1,
			is_template: false,
			topics: [],
			default_branch: 'main',
			owners: ['MyGithubTeam'],
		};

		const repoB = clone(repoA);
		repoB.full_name = 'guardian/bar';
		repoB.owners = ['SomeOtherTeam'];

		const got = ownersForStack([repoA, repoB], stackA);
		const want = ['MyGithubTeam'];

		expect(got).toEqual(want);
	});
});

// Until we can use structuredClone -
// https://developer.mozilla.org/en-US/docs/Web/API/structuredClone.
const clone = <A>(obj: A): A => {
	return JSON.parse(JSON.stringify(obj)) as A;
};
