import assert from 'assert';
import { describe, it } from 'node:test';
import type { repocop_github_repository_rules } from 'common/prisma-client/client.js';
import { findPotentialInteractives } from './topic-monitor-interactive.js';

void describe('findPotentialInteractives', () => {
	void it('should return an empty array when evaluatedRepos is empty', () => {
		const evaluatedRepos: repocop_github_repository_rules[] = [];
		const result = findPotentialInteractives(evaluatedRepos);
		assert.deepStrictEqual(result, []);
	});

	void it('should return an only repositories with no valid topics', () => {
		const exampleRepo = {
			full_name: 'org/repo1',
			default_branch_name: true,
			branch_protection: true,
			team_based_access: true,
			admin_access: true,
			archiving: true,
			topics: true,
			contents: true,
			vulnerability_tracking: false,
			evaluated_on: new Date(),
		};

		const evaluatedRepos: repocop_github_repository_rules[] = [
			exampleRepo,
			{ ...exampleRepo, full_name: 'org/repo2' },
			{ ...exampleRepo, full_name: 'org/repo3', topics: false },
		];

		const result = findPotentialInteractives(evaluatedRepos);
		assert.deepStrictEqual(result, ['org/repo3']);
	});
});
