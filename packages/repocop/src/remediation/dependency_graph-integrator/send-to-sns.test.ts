import type {
	github_languages,
	guardian_github_actions_usage,
} from '@prisma/client';
import type { Repository } from 'common/src/types';
import { removeRepoOwner } from '../shared-utilities';
import {
	checkRepoForLanguage,
	createSnsEventsForDependencyGraphIntegration,
	doesRepoHaveWorkflow,
} from './send-to-sns';

const fullName = 'guardian/repo-name';
const fullName2 = 'guardian/repo2';
const scalaLang = 'Scala';

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

function repoWithTargetLanguage(fullName: string): github_languages {
	return repoWithLanguages(fullName, ['Scala', 'TypeScript']);
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

describe('When trying to find repos using Scala', () => {
	test('return true if Scala is found in the repo', () => {
		const result = checkRepoForLanguage(
			repository(fullName),
			[repoWithTargetLanguage(fullName)],
			scalaLang,
		);

		expect(result).toBe(true);
	});
	test('return false if Scala is not found in the repo', () => {
		const result = checkRepoForLanguage(
			repository(fullName),
			[repoWithoutTargetLanguage(fullName)],
			scalaLang,
		);
		expect(result).toBe(false);
	});
});

describe('When checking a repo for an existing dependency submission workflow', () => {
	test('return true if repo workflow is present', () => {
		const result = doesRepoHaveWorkflow(
			repository(fullName),
			[repoWithDepSubmissionWorkflow(fullName)],
			'Scala',
		);
		expect(result).toBe(true);
	});
	test('return false if workflow is not present', () => {
		const result = doesRepoHaveWorkflow(
			repository(fullName),
			[repoWithoutWorkflow(fullName)],
			'Scala',
		);
		expect(result).toBe(false);
	});
});

describe('When getting suitable events to send to SNS', () => {
	test('return an event when a Scala repo is found without an existing workflow', () => {
		const result = createSnsEventsForDependencyGraphIntegration(
			[repoWithTargetLanguage(fullName)],
			[repository(fullName)],
			[repoWithoutWorkflow(fullName)],
		);
		expect(result).toEqual([
			{ name: removeRepoOwner(fullName), language: 'Scala' },
		]);
	});
	test('return empty event array when a Scala repo is found with an existing workflow', () => {
		const result = createSnsEventsForDependencyGraphIntegration(
			[repoWithTargetLanguage(fullName)],
			[repository(fullName)],
			[repoWithDepSubmissionWorkflow(fullName)],
		);
		expect(result).toEqual([]);
	});
	test('return empty array when non-Scala repo is found with without an existing workflow', () => {
		const result = createSnsEventsForDependencyGraphIntegration(
			[repoWithoutTargetLanguage(fullName)],
			[repository(fullName)],
			[repoWithoutWorkflow(fullName)],
		);
		expect(result).toEqual([]);
	});
	test('return 2 events when 2 Scala repos are found without an existing workflow', () => {
		const result = createSnsEventsForDependencyGraphIntegration(
			[repoWithTargetLanguage(fullName), repoWithTargetLanguage(fullName2)],
			[repository(fullName), repository(fullName2)],
			[repoWithoutWorkflow(fullName), repoWithoutWorkflow(fullName2)],
		);
		expect(result).toEqual([
			{ name: removeRepoOwner(fullName), language: 'Scala' },
			{ name: removeRepoOwner(fullName2), language: 'Scala' },
		]);
	});
});
