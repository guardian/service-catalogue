import type {
	github_languages,
	repocop_github_repository_rules,
} from '@prisma/client';
import { findUntrackedReposWhereIntegrationWillWork } from './send-to-sns';

function createEvaluatedRepo(
	fullName: string,
	vulnerabilityTracking: boolean,
): repocop_github_repository_rules {
	return {
		full_name: fullName,
		vulnerability_tracking: vulnerabilityTracking,
		default_branch_name: true,
		branch_protection: true,
		topics: true,
		contents: true,
		team_based_access: true,
		admin_access: true,
		archiving: true,
		evaluated_on: new Date(),
	};
}

function repoWithLanguages(
	fullName: string,
	languages: string[],
): github_languages {
	return {
		cq_sync_time: null,
		cq_parent_id: null,
		cq_id: '',
		cq_source_name: null,
		full_name: fullName,
		name: fullName,
		languages,
	};
}

function trackedRepo(fullName: string): repocop_github_repository_rules {
	return createEvaluatedRepo(fullName, true);
}

function untrackedRepo(fullName: string): repocop_github_repository_rules {
	return createEvaluatedRepo(fullName, false);
}

function withGoodLanguages(fullName: string): github_languages {
	return repoWithLanguages(fullName, ['Scala', 'TypeScript']);
}

function withBadLanguages(fullName: string): github_languages {
	return repoWithLanguages(fullName, ['Rust']);
}

function withGoodAndBadLanguages(fullName: string): github_languages {
	return repoWithLanguages(fullName, ['Scala', 'TypeScript', 'Rust']);
}

function withGoodAndIgnoredLanguages(fullName: string): github_languages {
	return repoWithLanguages(fullName, ['Scala', 'TypeScript', 'Shell', 'HTML']);
}

describe('When trying to find untracked repos where snyk integration will work', () => {
	test('return a result if an untracked repo contains only languages our action supports', () => {
		const actual = findUntrackedReposWhereIntegrationWillWork(
			[untrackedRepo('repo1')],
			[withGoodLanguages('repo1')],
		);

		expect(actual.length).toEqual(1);
	});
	test('do not return a result if an untracked repo contains only unsupported languages', () => {
		const actual = findUntrackedReposWhereIntegrationWillWork(
			[untrackedRepo('repo2')],
			[withBadLanguages('repo2')],
		);
		expect(actual.length).toEqual(0);
	});
	test('do not return a result if an untracked repo contains a mixture of supported and unsupported languages', () => {
		const actual = findUntrackedReposWhereIntegrationWillWork(
			[untrackedRepo('repo3')],
			[withGoodAndBadLanguages('repo3')],
		);
		expect(actual.length).toEqual(0);
	});
	test('do not return a result if repository is tracked', () => {
		const actual = findUntrackedReposWhereIntegrationWillWork(
			[trackedRepo('repo4')],
			[withGoodLanguages('repo4')],
		);
		expect(actual.length).toEqual(0);
	});

	test('return a result that removes languages ignored during snyk integration', () => {
		const actual = findUntrackedReposWhereIntegrationWillWork(
			[untrackedRepo('guardian/repo5')],
			[withGoodAndIgnoredLanguages('guardian/repo5')],
		);
		expect(actual).toStrictEqual([
			{
				name: 'repo5',
				languages: ['Scala', 'TypeScript'],
			},
		]);
	});
});
