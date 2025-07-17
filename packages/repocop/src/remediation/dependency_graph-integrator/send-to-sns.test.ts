import  assert from 'assert';
import { describe, it, mock, test} from 'node:test';
import type {
	github_languages,
	github_repository_custom_properties,
	guardian_github_actions_usage,
	view_repo_ownership,
} from '@prisma/client';
import type {
	DepGraphLanguage,
	Repository,
	RepositoryWithDepGraphLanguage,
} from 'common/src/types';
import type { Octokit } from 'octokit';
import { removeRepoOwner } from '../shared-utilities';
import {
	checkRepoForLanguage,
	createSnsEventsForDependencyGraphIntegration,
	doesRepoHaveDepSubmissionWorkflowForLanguage,
	getExistingPullRequest,
	getSuitableReposWithoutWorkflows,
} from './send-to-sns';

const fullName = 'guardian/repo-name';
const fullName2 = 'guardian/repo2';
const scala = 'Scala';
const kotlin = 'Kotlin';

function createActionsUsage(
	fullName: string,
	workflowUses: string[],
): guardian_github_actions_usage {
	return {
		evaluated_on: new Date('2024-01-01'),
		full_name: fullName,
		workflow_path: '.github/workflows/some-workflow.yaml',
		workflow_uses: workflowUses,
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

function repository(fullName: string): Repository {
	return {
		archived: false,
		name: removeRepoOwner(fullName),
		full_name: fullName,
		id: BigInt(1),
		default_branch: null,
		created_at: null,
		pushed_at: null,
		updated_at: null,
		topics: [],
	};
}

function repositoryWithDepGraphLanguage(
	fullName: string,
	language: DepGraphLanguage,
): RepositoryWithDepGraphLanguage {
	const repo = repository(fullName);
	return {
		...repo,
		dependency_graph_language: language,
	};
}

function repoWithTargetLanguage(
	fullName: string,
	language: DepGraphLanguage,
): github_languages {
	return repoWithLanguages(fullName, [language, 'TypeScript']);
}

function repoWithoutTargetLanguage(fullName: string): github_languages {
	return repoWithLanguages(fullName, ['Rust', 'Typescript']);
}

function repoWithDepSubmissionWorkflow(
	fullName: string,
): guardian_github_actions_usage {
	return createActionsUsage(fullName, [
		'actions/checkout@v2',
		'scalacenter/sbt-dependency-submission@v2',
		'aws-actions/configure-aws-credentials@v1',
	]);
}

function repoWithoutWorkflow(fullName: string): guardian_github_actions_usage {
	return createActionsUsage(fullName, [
		'actions/checkout@v2',
		'aws-actions/configure-aws-credentials@v1',
	]);
}

void describe('When trying to find repos using Scala', () => {
	void test('return true if Scala is found in the repo', () => {
		const result = checkRepoForLanguage(
			repository(fullName),
			[repoWithTargetLanguage(fullName, scala)],
			scala,
		);

		assert.strictEqual(result, true);
	});
	void test('return false if Scala is not found in the repo', () => {
		const result = checkRepoForLanguage(
			repository(fullName),
			[repoWithoutTargetLanguage(fullName)],
			scala,
		);
		assert.strictEqual(result, false);
	});
});

void describe('When checking a repo for an existing dependency submission workflow', () => {
	void test('return true if repo workflow is present', () => {
		const result = doesRepoHaveDepSubmissionWorkflowForLanguage(
			repository(fullName),
			[repoWithDepSubmissionWorkflow(fullName)],
			scala,
		);
		assert.strictEqual(result, true);
	});
	void test('return false if workflow is not present', () => {
		const result = doesRepoHaveDepSubmissionWorkflowForLanguage(
			repository(fullName),
			[repoWithoutWorkflow(fullName)],
			scala,
		);
		assert.strictEqual(result, false);
	});
});

void describe('When getting suitable repos to send to SNS', () => {
	void test('return the repo when a Scala repo is found without an existing workflow', () => {
		const result = getSuitableReposWithoutWorkflows(
			[repoWithTargetLanguage(fullName, scala)],
			[repository(fullName)],
			[repoWithoutWorkflow(fullName)],
			[],
		);
		const expected = [repositoryWithDepGraphLanguage(fullName, scala)];

		assert.deepStrictEqual(result, expected);
	});
	void test('return empty repo array when a Scala repo is found with an existing workflow', () => {
		const result = getSuitableReposWithoutWorkflows(
			[repoWithTargetLanguage(fullName, scala)],
			[repository(fullName)],
			[repoWithDepSubmissionWorkflow(fullName)],
			[],
		);
		assert.deepStrictEqual(result, []);
	});
	void test('return empty array when non-Scala/Kotlin repo is found with without an existing workflow', () => {
		const result = getSuitableReposWithoutWorkflows(
			[repoWithoutTargetLanguage(fullName)],
			[repository(fullName)],
			[repoWithoutWorkflow(fullName)],
			[],
		);
		assert.deepStrictEqual(result, []);
	});
	void test('return both repos when 2 Scala repos are found without an existing workflow', () => {
		const result = getSuitableReposWithoutWorkflows(
			[
				repoWithTargetLanguage(fullName, scala),
				repoWithTargetLanguage(fullName2, scala),
			],
			[repository(fullName), repository(fullName2)],
			[repoWithoutWorkflow(fullName), repoWithoutWorkflow(fullName2)],
			[],
		);
		const expected = [
			repositoryWithDepGraphLanguage(fullName, scala),
			repositoryWithDepGraphLanguage(fullName2, scala),
		];

		assert.deepStrictEqual(result, expected);
	});
	function exemptedCustomProperty(): github_repository_custom_properties {
		return {
			cq_sync_time: null,
			cq_source_name: null,
			cq_id: 'id1',
			cq_parent_id: null,
			org: 'guardian',
			property_name: 'gu_dependency_graph_integrator_ignore',
			repository_id: BigInt(1),
			value: scala,
		};
	}

	function nonExemptedCustomProperty(): github_repository_custom_properties {
		return {
			cq_sync_time: null,
			cq_source_name: null,
			cq_id: 'id1',
			cq_parent_id: null,
			org: 'guardian',
			property_name: 'gu_dependency_graph_integrator_ignore',
			repository_id: BigInt(12345),
			value: null,
		};
	}
	void test('return the repo when a Scala repo is found without an existing workflow and repo is not exempt', () => {
		const result = getSuitableReposWithoutWorkflows(
			[repoWithTargetLanguage(fullName, scala)],
			[repository(fullName)],
			[repoWithoutWorkflow(fullName)],
			[nonExemptedCustomProperty()],
		);
		const expected = [repositoryWithDepGraphLanguage(fullName, scala)];

		assert.deepStrictEqual(result, expected);
	});
	void test('return the repo when a Kotlin repo is found without an existing workflow and repo is not exempt', () => {
		const result = getSuitableReposWithoutWorkflows(
			[repoWithTargetLanguage(fullName, kotlin)],
			[repository(fullName)],
			[repoWithoutWorkflow(fullName)],
			[nonExemptedCustomProperty()],
		);
		const expected = [repositoryWithDepGraphLanguage(fullName, kotlin)];

		assert.deepStrictEqual(result, expected);
	});
	void test('return empty repo array when a Scala repo is found without an existing workflow but is exempt', () => {
		const result = getSuitableReposWithoutWorkflows(
			[repoWithTargetLanguage(fullName, scala)],
			[repository(fullName)],
			[repoWithoutWorkflow(fullName)],
			[exemptedCustomProperty()],
		);
		assert.deepStrictEqual(result, []);
	});
	void test('return empty repo array when a Kotlin repo is found without an existing workflow but is exempt', () => {
		const result = getSuitableReposWithoutWorkflows(
			[repoWithTargetLanguage(fullName, kotlin)],
			[repository(fullName)],
			[repoWithoutWorkflow(fullName)],
			[{ ...exemptedCustomProperty(), value: kotlin }],
		);
		assert.deepStrictEqual(result, []);
	});

	const ownershipRecord1: view_repo_ownership = {
		full_repo_name: fullName,
		github_team_id: BigInt(1),
		github_team_name: 'team-name',
		github_team_slug: 'team-slug',
		short_repo_name: 'repo-name',
		role_name: 'admin',
		archived: false,
		galaxies_team: 'Team',
		team_contact_email: 'team@team.com',
	};

	void test('return an event with an admins where they exist', () => {
		const ownershipRecord2: view_repo_ownership = {
			...ownershipRecord1,
			github_team_id: BigInt(2),
			github_team_slug: 'team-slug2',
			github_team_name: 'team-name2',
		};

		const result = createSnsEventsForDependencyGraphIntegration(
			[repositoryWithDepGraphLanguage(fullName, scala)],
			[ownershipRecord1, ownershipRecord2],
		);
		assert.deepStrictEqual(result, [
			{
				name: removeRepoOwner(fullName),
				language: scala,
				admins: ['team-slug', 'team-slug2'],
			},
		]);
	});
	void test('do not return event with an admin if none are correct', () => {
		const ownershipRecord: view_repo_ownership = {
			...ownershipRecord1,
			full_repo_name: 'guardian/other-repo',
			short_repo_name: 'other-repo',
		};

		const result = createSnsEventsForDependencyGraphIntegration(
			[repositoryWithDepGraphLanguage(fullName, scala)],
			[ownershipRecord],
		);
		assert.deepStrictEqual(result, [
			{
				name: removeRepoOwner(fullName),
				language: scala,
				admins: [],
			},
		]);
	});
});

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

void describe('getPullRequest', () => {
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

	void it('should return undefined when no matching branch found', async () => {
		const pulls = [featureBranch];
		const foundPull = await getExistingPullRequest(
			mockOctokit(pulls),
			'repo',
			'owner',
			'gu-dependency-graph-integrator[bot]',
		);
		assert.strictEqual(foundPull, undefined);
	});

	void it('should return pull request when author matches', async () => {
		const pulls = [featureBranch, dependabotBranch];
		const foundPull = await getExistingPullRequest(
			mockOctokit(pulls),
			'repo',
			'owner',
			'gu-dependency-graph-integrator[bot]',
		);
		assert.strictEqual(foundPull, dependabotBranch);
	});

	void it('should return first pull request that matches and log warning', async () => {
		const warnMock = mock.method(console, 'warn');
		const pulls = [featureBranch, dependabotBranch, dependabotBranch2];
		const foundPull = await getExistingPullRequest(
			mockOctokit(pulls),
			'repo',
			'owner',
			'gu-dependency-graph-integrator[bot]',
		);
		assert.strictEqual(foundPull, dependabotBranch);
		assert.ok(
			warnMock.mock.calls.some(
				call => call.arguments[0] === 'Found 2 PRs on repo - choosing the first.'
			)
		);
		warnMock.mock.restore();
	});
});
