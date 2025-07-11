import type { repocop_github_repository_rules } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { findPotentialInteractives } from './topic-monitor-interactive';

describe('findPotentialInteractives', () => {
	it('should return an empty array when evaluatedRepos is empty', () => {
		const evaluatedRepos: repocop_github_repository_rules[] = [];
		const result = findPotentialInteractives(evaluatedRepos);
		expect(result).toEqual([]);
	});

	it('should return an only repositories with no valid topics', () => {
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
		expect(result).toEqual(['org/repo3']);
	});
});
